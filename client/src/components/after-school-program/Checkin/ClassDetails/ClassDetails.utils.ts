import type { AcuityTypes, AfterSchoolEnrolment } from 'fizz-kidz'
import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'

export function getEnrolment(
    appointment: AcuityTypes.Api.Appointment,
    enrolmentsMap: { [key: string]: AfterSchoolEnrolment }
) {
    const firestoreId = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.FIRESTORE,
        AcuityConstants.FormFields.FIRESTORE_ID
    )
    return enrolmentsMap[firestoreId]
}
