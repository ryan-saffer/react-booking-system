import fs from 'fs'
import path from 'path'

import { green, yellow } from 'colorette'

import { AcuityClient } from '../../acuity/core/acuity-client'

export async function getEnrolments(term: string) {
    try {
        console.log()
        console.log(yellow('Fetching Science Club appointment types...'))
        const acuityClient = await AcuityClient.getInstance()
        const result = (
            await acuityClient.getAppointmentTypes({
                category: ['Science Club'],
                availableToBook: false,
            })
        ).filter((it) => it.name.includes(term))

        console.log(yellow('Fetching all appointment for the term...'))
        const appointmentsArr = await Promise.all(
            result.map((appointmentType) =>
                acuityClient.searchForAppointments({
                    appointmentTypeId: appointmentType.id,
                })
            )
        )

        console.log(yellow("Writing output to 'output.txt'..."))
        const filePath = path.join(__dirname, 'output.txt')
        appointmentsArr.forEach((appointments) => {
            // Convert each object to a string and join them wappointmenth newlines
            const content = appointments.map((appointment) => appointment.email).join('\n') // Serialize objects
            fs.appendFileSync(filePath, content, 'utf8') // Append to file
        })

        console.log()
        console.log(green('*** Script complete ***'))
        console.log(green("See 'output.txt' for all email addresses."))
    } catch (err) {
        console.log({ err })
    }
}
