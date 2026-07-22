import { describe, expect, it } from 'vitest'

import { AcuityConstants } from 'fizz-kidz'
import type { AcuityTypes } from 'fizz-kidz'

import { getPreschoolAttendanceDetails, getPreschoolAttendanceStatus } from './acuity-attendance'

function makeAppointment(overrides: Partial<AcuityTypes.Api.Appointment> = {}): AcuityTypes.Api.Appointment {
    return {
        id: 1,
        email: 'parent@example.com',
        firstName: 'Parent',
        lastName: 'Person',
        phone: '0400000000',
        appointmentTypeID: AcuityConstants.AppointmentTypes.TEST_PRESCHOOL_PROGRAM,
        classID: 10,
        type: 'Preschool Program',
        price: '54',
        forms: [],
        notes: '',
        calendarID: AcuityConstants.TestCalendarId,
        calendar: 'Test',
        paid: 'yes',
        location: 'Test Studio',
        datetime: '2026-06-15T10:00:00+10:00',
        confirmationPage: '',
        certificate: '',
        duration: '150',
        ...overrides,
    }
}

function makeForm(id: number, values: Array<{ fieldID: number; value: string }>): AcuityTypes.Api.Form {
    return {
        id,
        name: 'Form',
        values: values.map((value, index) => ({ id: index + 1, name: 'Field', ...value })),
    }
}

describe('preschool attendance Acuity parsing', () => {
    it('parses child, parent, allergy, anaphylaxis and emergency details', () => {
        const appointment = makeAppointment({
            forms: [
                makeForm(AcuityConstants.Forms.CHILDREN_DETAILS, [
                    { fieldID: AcuityConstants.FormFields.CHILDREN_NAMES, value: 'Charlie Child' },
                    { fieldID: AcuityConstants.FormFields.CHILDREN_AGES, value: '4' },
                    {
                        fieldID: AcuityConstants.FormFields.CHILDREN_ALLERGIES,
                        value: 'Peanuts\n\nAnaphylaxis plan: anaphylaxisPlans/preschool-v2-child-plan.pdf',
                    },
                    { fieldID: AcuityConstants.FormFields.CHILD_ADDITIONAL_INFO, value: 'Needs quiet transitions' },
                ]),
                makeForm(AcuityConstants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT, [
                    { fieldID: AcuityConstants.FormFields.EMERGENCY_CONTACT_NAME_HP, value: 'Emergency Person' },
                    { fieldID: AcuityConstants.FormFields.EMERGENCY_CONTACT_NUMBER_HP, value: '0411111111' },
                    { fieldID: AcuityConstants.FormFields.EMERGENCY_CONTACT_RELATION_HP, value: 'Grandparent' },
                ]),
            ],
        })

        expect(getPreschoolAttendanceDetails(appointment)).toEqual({
            childName: 'Charlie Child',
            childAge: '4',
            allergies: 'Peanuts',
            isAnaphylactic: true,
            anaphylaxisPlanPath: 'anaphylaxisPlans/preschool-v2-child-plan.pdf',
            additionalInfo: 'Needs quiet transitions',
            parentName: 'Parent Person',
            parentPhone: '0400000000',
            parentEmail: 'parent@example.com',
            emergencyContactName: 'Emergency Person',
            emergencyContactPhone: '0411111111',
            emergencyContactRelation: 'Grandparent',
        })
    })

    it('handles missing optional Acuity fields safely', () => {
        const details = getPreschoolAttendanceDetails(makeAppointment())

        expect(details.childName).toBe('Child name unavailable')
        expect(details.allergies).toBe('')
        expect(details.isAnaphylactic).toBe(false)
        expect(details.additionalInfo).toBe('')
        expect(details.emergencyContactName).toBe('')
    })

    it('detects attendance labels regardless of label order', () => {
        expect(
            getPreschoolAttendanceStatus({
                labels: [
                    { id: 999, name: 'Other' },
                    { id: AcuityConstants.Labels.CHECKED_IN, name: 'Checked in' },
                ],
            })
        ).toBe('signed-in')
        expect(
            getPreschoolAttendanceStatus({
                labels: [{ id: AcuityConstants.Labels.CHECKED_OUT, name: 'Checked out' }],
            })
        ).toBe('signed-out')
        expect(getPreschoolAttendanceStatus({ labels: [] })).toBe('not-signed-in')
    })
})
