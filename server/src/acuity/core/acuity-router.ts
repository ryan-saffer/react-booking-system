import { AcuityTypes } from 'fizz-kidz'

import { acuityAuthenticatedProcedure, acuityPublicProcedure, router } from '../../trpc/trpc'

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
        .query(({ ctx, input }) =>
            ctx.acuityClient.getClasses(input.appointmentTypeId, input.includeUnavailable, input.minDate)
        ),
    checkCertificate: acuityPublicProcedure
        .input((input: unknown) => input as AcuityTypes.Client.CheckCertificateParams)
        .query(({ ctx, input }) =>
            ctx.acuityClient.checkCertificate(input.certificate, input.appointmentTypeId, input.email)
        ),
})
