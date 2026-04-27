import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'

import { AcuityClient } from '@/acuity/core/acuity-client'
import { DatabaseClient } from '@/firebase/DatabaseClient'

type RemovePreschoolProgramClassParams = {
    appointmentTypeId: number
    classId: number
    cancelAppointments?: boolean
    dryRun?: boolean
}

type RemovePreschoolProgramClassResult = {
    appointmentTypeId: number
    classId: number
    className: string | null
    classTime: string | null
    cancelledAppointmentIds: number[]
    failedCancellationAppointmentIds: number[]
    unmatchedAppointmentIds: number[]
    affectedEnrolments: Array<{
        enrolmentId: string
        removedAppointmentIds: number[]
        remainingAppointmentCount: number
    }>
}

export async function removePreschoolProgramClass(
    input: RemovePreschoolProgramClassParams
): Promise<RemovePreschoolProgramClassResult> {
    const acuityClient = await AcuityClient.getInstance()
    const [classes, enrolments, classAppointments] = await Promise.all([
        acuityClient.getClasses([input.appointmentTypeId], true),
        DatabaseClient.getPreschoolProgramEnrolments(input.appointmentTypeId, { includeInactive: true }),
        acuityClient.searchForAppointments({
            appointmentTypeId: input.appointmentTypeId,
            classId: input.classId,
            maxResults: 1000,
        }),
    ])

    const klass = classes.find((item) => item.id === input.classId)
    const enrolmentsById = new Map(enrolments.map((enrolment) => [enrolment.id, enrolment]))
    const appointmentsByEnrolment = new Map<string, number[]>()
    const unmatchedAppointmentIds: number[] = []

    for (const appointment of classAppointments) {
        const firestoreId = AcuityUtilities.retrieveFormAndField(
            appointment,
            AcuityConstants.Forms.FIRESTORE,
            AcuityConstants.FormFields.FIRESTORE_ID
        )

        const enrolment =
            (firestoreId ? enrolmentsById.get(firestoreId) : undefined) ??
            enrolments.find((item) => item.appointments.includes(appointment.id))

        if (!enrolment) {
            unmatchedAppointmentIds.push(appointment.id)
            continue
        }

        const appointmentIds = appointmentsByEnrolment.get(enrolment.id) ?? []
        appointmentIds.push(appointment.id)
        appointmentsByEnrolment.set(enrolment.id, appointmentIds)
    }

    const affectedEnrolments = Array.from(appointmentsByEnrolment.entries()).map(([enrolmentId, appointmentIds]) => {
        const enrolment = enrolmentsById.get(enrolmentId)

        if (!enrolment) {
            throw new Error(`missing Preschool Program enrolment with id: ${enrolmentId}`)
        }

        return {
            enrolment,
            enrolmentId,
            removedAppointmentIds: appointmentIds,
            remainingAppointmentCount: enrolment.appointments.filter((id) => !appointmentIds.includes(id)).length,
        }
    })

    const result: RemovePreschoolProgramClassResult = {
        appointmentTypeId: input.appointmentTypeId,
        classId: input.classId,
        className: klass?.name ?? classAppointments[0]?.type ?? null,
        classTime: klass?.time ?? classAppointments[0]?.datetime ?? null,
        cancelledAppointmentIds: [],
        failedCancellationAppointmentIds: [],
        unmatchedAppointmentIds,
        affectedEnrolments: affectedEnrolments.map((item) => ({
            enrolmentId: item.enrolmentId,
            removedAppointmentIds: item.removedAppointmentIds,
            remainingAppointmentCount: item.remainingAppointmentCount,
        })),
    }

    if (input.dryRun) {
        return result
    }

    const removableAppointmentIds = new Set<number>()

    if (input.cancelAppointments === false) {
        classAppointments.forEach((appointment) => removableAppointmentIds.add(appointment.id))
    } else {
        const cancellations = await Promise.allSettled(
            classAppointments.map(async (appointment) => {
                await acuityClient.cancelAppointment(appointment.id)
                return appointment.id
            })
        )

        cancellations.forEach((cancellation, index) => {
            if (cancellation.status === 'fulfilled') {
                removableAppointmentIds.add(cancellation.value)
                result.cancelledAppointmentIds.push(cancellation.value)
                return
            }

            const appointmentId = classAppointments[index]?.id
            if (appointmentId) {
                result.failedCancellationAppointmentIds.push(appointmentId)
            }
        })
    }

    await Promise.all(
        affectedEnrolments.map(async ({ enrolment, enrolmentId, removedAppointmentIds }) => {
            const appointmentIdsToRemove = removedAppointmentIds.filter((appointmentId) =>
                removableAppointmentIds.has(appointmentId)
            )

            if (appointmentIdsToRemove.length === 0) {
                return
            }

            const appointments = enrolment.appointments.filter(
                (appointmentId) => !removableAppointmentIds.has(appointmentId)
            )
            const signatures = Object.fromEntries(
                Object.entries(enrolment.signatures).filter(
                    ([appointmentId]) => !removableAppointmentIds.has(parseInt(appointmentId, 10))
                )
            )

            await DatabaseClient.updatePreschoolProgramEnrolment(enrolmentId, {
                appointments,
                signatures,
                status: appointments.length === 0 ? 'inactive' : enrolment.status,
                updatedAt: new Date(),
            })
        })
    )

    result.affectedEnrolments = affectedEnrolments.map((item) => {
        const removedAppointmentIds = item.removedAppointmentIds.filter((appointmentId) =>
            removableAppointmentIds.has(appointmentId)
        )

        return {
            enrolmentId: item.enrolmentId,
            removedAppointmentIds,
            remainingAppointmentCount: item.enrolment.appointments.filter(
                (appointmentId) => !removableAppointmentIds.has(appointmentId)
            ).length,
        }
    })

    return result
}
