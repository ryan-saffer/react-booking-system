import { FreeHolidayProgramBooking } from 'fizz-kidz'

import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { throwTrpcError } from '../../../utilities'
import { checkDiscountCode } from '../../core/check-discount-code'
import { CreateDiscountCode, createDiscountCode } from '../../core/create-discount-code'
import {
    CreateDiscountCodeFromInvitation,
    createDiscountCodeFromInvitation,
} from '../../core/create-discount-code-from-invitation'
import { scheduleHolidayProgram } from '../../core/schedule-holiday-program'
import { sendConfirmationEmail } from '../../core/send-confirmation-email'

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
    createDiscountCodeFromInvitation: publicProcedure
        .input((input: unknown) => input as CreateDiscountCodeFromInvitation)
        .mutation(({ input }) => createDiscountCodeFromInvitation(input)),
    checkDiscountCode: publicProcedure
        .input((input: unknown) => input as { code: string })
        .mutation(({ input }) => checkDiscountCode(input.code)),
})

export const holidayPrograms = onRequestTrpc(holidayProgramsRouter)
