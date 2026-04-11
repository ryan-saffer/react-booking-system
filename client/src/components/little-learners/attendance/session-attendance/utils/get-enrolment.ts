import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'
import type { AcuityTypes, LittleLearnersEnrolment } from 'fizz-kidz'

export type LittleLearnersAttendanceEnrolment = Omit<LittleLearnersEnrolment, 'createdAt' | 'updatedAt'> & {
    createdAt: Date | string
    updatedAt: Date | string
}

export function getEnrolment(
    appointment: AcuityTypes.Api.Appointment,
    enrolmentsMap: Record<string, LittleLearnersAttendanceEnrolment>
) {
    const firestoreId = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.FIRESTORE,
        AcuityConstants.FormFields.FIRESTORE_ID
    )

    return enrolmentsMap[firestoreId]
}
