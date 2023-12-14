import { AcuityConstants, AcuityTypes, AcuityUtilities, AfterSchoolEnrolment } from 'fizz-kidz'

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
