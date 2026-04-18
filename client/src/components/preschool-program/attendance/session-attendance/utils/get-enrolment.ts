import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'
import type { AcuityTypes, PreschoolProgramEnrolment } from 'fizz-kidz'

export type PreschoolProgramAttendanceEnrolment = Omit<PreschoolProgramEnrolment, 'createdAt' | 'updatedAt'> & {
    createdAt: Date | string
    updatedAt: Date | string
}

export function getEnrolment(
    appointment: AcuityTypes.Api.Appointment,
    enrolmentsMap: Record<string, PreschoolProgramAttendanceEnrolment>
) {
    const firestoreId = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.FIRESTORE,
        AcuityConstants.FormFields.FIRESTORE_ID
    )

    return enrolmentsMap[firestoreId]
}
