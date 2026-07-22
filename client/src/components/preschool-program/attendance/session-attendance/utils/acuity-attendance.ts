import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'
import type { AcuityTypes } from 'fizz-kidz'

const ANAPHYLAXIS_PLAN_PREFIX = 'Anaphylaxis plan:'

export type PreschoolAttendanceStatus = 'not-signed-in' | 'signed-in' | 'signed-out' | 'not-attending'

/** Extracts defensive, display-ready preschool attendance details from an Acuity appointment. */
export function getPreschoolAttendanceDetails(appointment: AcuityTypes.Api.Appointment) {
    const allergiesValue = getField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_ALLERGIES
    )
    const allergyLines = allergiesValue
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    const planLine = allergyLines.find((line) => line.startsWith(ANAPHYLAXIS_PLAN_PREFIX))
    const allergies = allergyLines.filter((line) => !line.startsWith(ANAPHYLAXIS_PLAN_PREFIX)).join('\n')

    return {
        childName:
            getField(appointment, AcuityConstants.Forms.CHILDREN_DETAILS, AcuityConstants.FormFields.CHILDREN_NAMES) ||
            'Child name unavailable',
        childAge: getField(
            appointment,
            AcuityConstants.Forms.CHILDREN_DETAILS,
            AcuityConstants.FormFields.CHILDREN_AGES
        ),
        allergies,
        isAnaphylactic: !!planLine,
        anaphylaxisPlanPath: planLine?.slice(ANAPHYLAXIS_PLAN_PREFIX.length).trim() || '',
        additionalInfo: getField(
            appointment,
            AcuityConstants.Forms.CHILDREN_DETAILS,
            AcuityConstants.FormFields.CHILD_ADDITIONAL_INFO
        ),
        parentName: `${appointment.firstName || ''} ${appointment.lastName || ''}`.trim(),
        parentPhone: appointment.phone || '',
        parentEmail: appointment.email || '',
        emergencyContactName: getField(
            appointment,
            AcuityConstants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
            AcuityConstants.FormFields.EMERGENCY_CONTACT_NAME_HP
        ),
        emergencyContactPhone: getField(
            appointment,
            AcuityConstants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
            AcuityConstants.FormFields.EMERGENCY_CONTACT_NUMBER_HP
        ),
        emergencyContactRelation: getField(
            appointment,
            AcuityConstants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
            AcuityConstants.FormFields.EMERGENCY_CONTACT_RELATION_HP
        ),
    }
}

/** Resolves attendance state from Acuity labels without relying on label order. */
export function getPreschoolAttendanceStatus(
    appointment: Pick<AcuityTypes.Api.Appointment, 'labels'>
): PreschoolAttendanceStatus {
    const labelIds = new Set(appointment.labels?.map((label) => label.id) || [])

    if (labelIds.has(AcuityConstants.Labels.CHECKED_OUT)) return 'signed-out'
    if (labelIds.has(AcuityConstants.Labels.CHECKED_IN)) return 'signed-in'
    if (labelIds.has(AcuityConstants.Labels.NOT_ATTENDING)) return 'not-attending'
    return 'not-signed-in'
}

/** Reads and normalises one optional Acuity form field to a trimmed string. */
function getField(appointment: AcuityTypes.Api.Appointment, formId: number, fieldId: number) {
    const value = AcuityUtilities.retrieveFormAndField(appointment, formId, fieldId)
    return typeof value === 'string' ? value.trim() : value == null ? '' : String(value)
}
