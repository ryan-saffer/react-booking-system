import { DateTime } from 'luxon'
import prompts from 'prompts'

import { AcuityClient } from '@/acuity/core/acuity-client'
import { env } from '@/init'
import { removePreschoolProgramClass } from '@/preschool-program/core/remove-preschool-program-class'

export async function runRemovePreschoolProgramClassScript() {
    const acuityClient = await AcuityClient.getInstance()
    const category: Array<'preschool-program' | 'preschool-program-test'> =
        env === 'prod' ? ['preschool-program'] : ['preschool-program-test']
    const now = DateTime.now()

    const appointmentTypes = await acuityClient.getAppointmentTypes({ category })

    const { appointmentTypeIds } = await prompts({
        type: 'multiselect',
        name: 'appointmentTypeIds',
        message: 'Select Preschool Program appointment types',
        instructions: false,
        choices: appointmentTypes
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((appointmentType) => ({
                title: appointmentType.name,
                value: appointmentType.id,
            })),
        min: 1,
    })

    if (!appointmentTypeIds || appointmentTypeIds.length === 0) {
        return
    }

    const selections: Array<{ appointmentTypeId: number; classId: number }> = []

    for (const appointmentTypeId of appointmentTypeIds as number[]) {
        const appointmentType = appointmentTypes.find((item) => item.id === appointmentTypeId)

        if (!appointmentType) {
            throw new Error(`missing Acuity appointment type with id: ${appointmentTypeId}`)
        }

        const classes = (await acuityClient.getClasses([appointmentTypeId], true))
            .slice()
            .sort(
                (a, b) =>
                    DateTime.fromISO(a.time, { setZone: true }).toMillis() -
                    DateTime.fromISO(b.time, { setZone: true }).toMillis()
            )

        if (classes.length === 0) {
            throw new Error(`no classes found for Preschool Program appointment type: ${appointmentType.name}`)
        }

        const firstUpcomingIndex = Math.max(
            classes.findIndex(
                (klass) => DateTime.fromISO(klass.time, { setZone: true }).startOf('minute') >= now.startOf('minute')
            ),
            0
        )

        const { classId } = await prompts({
            type: 'select',
            name: 'classId',
            message: `Select the class to remove for ${appointmentType.name}`,
            initial: firstUpcomingIndex,
            choices: classes.map((klass) => ({
                title: `${DateTime.fromISO(klass.time, { setZone: true }).toFormat('ccc d LLL yyyy, h:mm a')} (${klass.slotsAvailable} slots left)`,
                value: klass.id,
            })),
        })

        if (!classId) {
            return
        }

        selections.push({
            appointmentTypeId,
            classId,
        })
    }

    const previewResults = []
    for (const selection of selections) {
        previewResults.push(
            await removePreschoolProgramClass({
                appointmentTypeId: selection.appointmentTypeId,
                classId: selection.classId,
                dryRun: true,
            })
        )
    }

    console.table(
        previewResults.map((result) => ({
            appointmentTypeId: result.appointmentTypeId,
            classId: result.classId,
            classTime: result.classTime ?? 'Unknown',
            bookedAppointments: result.affectedEnrolments.reduce(
                (count, enrolment) => count + enrolment.removedAppointmentIds.length,
                0
            ),
            affectedEnrolments: result.affectedEnrolments.length,
            unmatchedAppointments: result.unmatchedAppointmentIds.length,
        }))
    )

    const { shouldCancelAppointments, confirmed } = await prompts([
        {
            type: 'toggle',
            name: 'shouldCancelAppointments',
            message: 'Cancel the matching Acuity appointments before updating Firestore?',
            initial: true,
            active: 'yes',
            inactive: 'no',
        },
        {
            type: 'confirm',
            name: 'confirmed',
            message: 'Run this Preschool Program class cleanup now?',
            initial: false,
        },
    ])

    if (!confirmed) {
        return
    }

    const results = []
    for (const selection of selections) {
        results.push(
            await removePreschoolProgramClass({
                appointmentTypeId: selection.appointmentTypeId,
                classId: selection.classId,
                cancelAppointments: shouldCancelAppointments,
            })
        )
    }

    console.table(
        results.map((result) => ({
            appointmentTypeId: result.appointmentTypeId,
            classId: result.classId,
            classTime: result.classTime ?? 'Unknown',
            removedAppointments: result.affectedEnrolments.reduce(
                (count, enrolment) => count + enrolment.removedAppointmentIds.length,
                0
            ),
            affectedEnrolments: result.affectedEnrolments.filter(
                (enrolment) => enrolment.removedAppointmentIds.length > 0
            ).length,
            cancelledInAcuity: result.cancelledAppointmentIds.length,
            failedCancellations: result.failedCancellationAppointmentIds.length,
            unmatchedAppointments: result.unmatchedAppointmentIds.length,
        }))
    )
}
