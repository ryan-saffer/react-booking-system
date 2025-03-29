import { AcuityConstants, AcuityTypes } from 'fizz-kidz'

import { acuityAuthenticatedProcedure, acuityPublicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { mergeAcuityWithStoryblok } from '../../core/merge-storyblok-with-acuity'

export const acuityRouter = router({
    updateLabel: acuityAuthenticatedProcedure
        .input((input: unknown) => input as AcuityTypes.Client.UpdateLabelParams)
        .mutation(({ ctx, input }) => ctx.acuityClient.updateLabel(input)),
    getAppointmentTypes: acuityPublicProcedure
        .input((input: unknown) => input as AcuityTypes.Client.GetAppointmentTypesParams)
        .query(({ ctx, input }) => ctx.acuityClient.getAppointmentTypes(input)),
    updateAppointment: acuityPublicProcedure
        .input((input: unknown) => input as AcuityTypes.Client.UpdateAppointmentParams)
        .mutation(({ ctx, input }) => ctx.acuityClient.updateAppointment(input)),
    searchForAppointments: acuityAuthenticatedProcedure
        .input((input: unknown) => input as AcuityTypes.Client.FetchAppointmentsParams)
        .mutation(({ ctx, input }) => ctx.acuityClient.searchForAppointments(input)),
    getAppointments: acuityPublicProcedure
        .input((input: unknown) => input as AcuityTypes.Client.GetAppointmentsParams)
        .query(({ ctx, input }) => ctx.acuityClient.getAppointments(input.ids)),
    classAvailability: acuityPublicProcedure
        .input((input: unknown) => input as AcuityTypes.Client.ClassAvailabilityParams)
        .query(
            /***
             * Returns acuity classes, but in the case the class is a holiday program, it will additionally return the title and creations.
             */
            async ({ ctx, input }): Promise<AcuityTypes.Client.Class[]> => {
                const acuityPrograms = await ctx.acuityClient.getClasses(
                    input.appointmentTypeId,
                    input.includeUnavailable,
                    input.minDate
                )

                // for holiday programs, get the storyblok programs and merge them together
                if (input.appointmentTypeId === AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM) {
                    const mergedPrograms = await mergeAcuityWithStoryblok(acuityPrograms)
                    return mergedPrograms
                }

                return acuityPrograms
            }
        ),
})

export const acuity = onRequestTrpc(acuityRouter)
