import { publicProcedure, router } from '../../../trpc/trpc'

import { FreeHolidayProgramBooking } from 'fizz-kidz'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { scheduleHolidayProgram } from '../../core/schedule-holiday-program'
import { sendConfirmationEmail } from '../../core/send-confirmation-email'
import { throwTrpcError } from '../../../utilities'

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
})

export const holidayPrograms = onRequestTrpc(holidayProgramsRouter)
