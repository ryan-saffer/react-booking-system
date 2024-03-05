import { DiscountCode, FreeHolidayProgramBooking, WithoutId } from 'fizz-kidz'

import type { MixpanelEvent } from '../../../mixpanel/mixpanel-client'
import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { throwTrpcError } from '../../../utilities'
import { checkDiscountCode } from '../../core/check-discount-code'
import { createDiscountCode } from '../../core/create-discount-code'
import { scheduleHolidayProgram } from '../../core/schedule-holiday-program'
import { sendConfirmationEmail } from '../../core/send-confirmation-email'

export type CreateDiscountCode = WithoutId<
    Omit<DiscountCode, 'expiryDate' | 'numberOfUses'> &
        (
            | { expiryDate: Date }
            | {
                  expiryDate: 'auto-upcoming'
                  name: string
                  email: string
                  invitationId: string
                  viewUsed: MixpanelEvent['invitation-coupon-signup']['view']
              }
        )
>

export const holidayProgramsRouter = router({
    scheduleFreeHolidayPrograms: publicProcedure
        .input((input: unknown) => input as FreeHolidayProgramBooking[])
        .mutation(async ({ input }) => {
            try {
                const result = await Promise.all(input.map((program) => scheduleHolidayProgram(program)))
                await sendConfirmationEmail(result)
            } catch (err) {
                throwTrpcError('INTERNAL_SERVER_ERROR', 'There was an error booking into the holiday programs', err)
            }
        }),
    createDiscountCode: authenticatedProcedure
        .input((input: unknown) => input as CreateDiscountCode)
        .mutation(({ input }) => createDiscountCode(input)),
    checkDiscountCode: publicProcedure
        .input((input: unknown) => input as { code: string })
        .mutation(({ input }) => checkDiscountCode(input.code)),
})

export const holidayPrograms = onRequestTrpc(holidayProgramsRouter)
