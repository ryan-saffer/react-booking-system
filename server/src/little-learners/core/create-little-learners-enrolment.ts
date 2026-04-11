import type { CreateLittleLearnersEnrolmentParams, LittleLearnersEnrolment } from 'fizz-kidz'
import { AcuityConstants } from 'fizz-kidz'

import { AcuityClient } from '@/acuity/core/acuity-client'
import { FirestoreRefs } from '@/firebase/FirestoreRefs'
import { throwTrpcError } from '@/utilities'

import { resolveCalendarStudio } from './resolve-calendar-studio'

export async function createLittleLearnersEnrolment(input: CreateLittleLearnersEnrolmentParams) {
    const newDoc = (await FirestoreRefs.littleLearnersEnrolments()).doc()

    const acuityClient = await AcuityClient.getInstance()
    const calendars = await acuityClient.getCalendars()
    const calendar = calendars.find((it) => it.id === input.calendarId)

    if (!calendar) {
        throwTrpcError('NOT_FOUND', `could not find matching calendar in acuity with id: ${input.calendarId}`)
    }

    const studio = resolveCalendarStudio(input.calendarId)

    if (!studio) {
        throwTrpcError(
            'INTERNAL_SERVER_ERROR',
            `could not resolve Little Learners studio from acuity calendar: ${calendar.name}`
        )
    }

    const classes = await acuityClient.getClasses([input.appointmentTypeId], false, Date.now())

    if (classes.length === 0) {
        throwTrpcError(
            'NOT_FOUND',
            `could not find classes in acuity with appointment type id: ${input.appointmentTypeId}`
        )
    }

    const appointments = await (async () => {
        try {
            return await Promise.all(
                classes.map((klass) =>
                    acuityClient.scheduleAppointment({
                        appointmentTypeID: input.appointmentTypeId,
                        datetime: klass.time,
                        firstName: input.parent.firstName,
                        lastName: input.parent.lastName,
                        email: input.parent.email,
                        phone: input.parent.phone,
                        fields: [{ id: AcuityConstants.FormFields.FIRESTORE_ID, value: newDoc.id }],
                    })
                )
            )
        } catch (err) {
            throwTrpcError('INTERNAL_SERVER_ERROR', 'There was an error enrolling into the program', err)
        }
    })()

    const now = new Date()
    const enrolment: LittleLearnersEnrolment = {
        ...input,
        id: newDoc.id,
        appointments: appointments.map((appointment) => appointment.id),
        price: appointments[0]?.price ?? '0.00',
        status: 'active',
        studio,
        invoiceId: '',
        notes: '',
        createdAt: now,
        updatedAt: now,
        signatures: appointments.reduce(
            (accumulator, appointment) => ({ ...accumulator, [appointment.id]: '' }),
            {} as LittleLearnersEnrolment['signatures']
        ),
        child: {
            ...input.child,
            allergies: input.child.allergies || '',
            additionalInfo: input.child.additionalInfo || '',
        },
    }

    await newDoc.set(enrolment)

    return enrolment
}
