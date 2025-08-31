import type { AcuityTypes } from 'fizz-kidz'
import { StoryblokClient, type HolidayProgramWeek } from '../../storyblok/storyblok-client'

/**
 * Given a bunch of acuity classes, it will get all the storyblok holiday programs, and match each acuity
 * class up based on the date and time.
 *
 * If found, it will add the classes 'title' and 'creations' on to the class.
 */
export async function mergeAcuityWithStoryblok(acuityPrograms: AcuityTypes.Api.Class[]) {
    const storyblokClient = await StoryblokClient.getInstance()
    const storyblokWeeks = await storyblokClient.getHolidayPrograms()
    const storyblokPrograms = storyblokWeeks.reduce(
        (acc, curr) => [...acc, ...curr.programs],
        [] as HolidayProgramWeek['programs']
    )
    const mergedPrograms = acuityPrograms.map((program) => {
        const storyblokProgram = storyblokPrograms.find((blok) => {
            const [acuityDate, acuityTime] = program.time.split('T')
            const [blokDate] = blok.date.toISOString().split('T')
            // they match if the date is the same, slot is morning and time is 10:00 or slot is afternoon and time is 13:30
            return (
                acuityDate === blokDate &&
                ((blok.slot === 'morning' && acuityTime.startsWith('10')) ||
                    (blok.slot === 'afternoon' && acuityTime.startsWith('13')))
            )
        })
        if (storyblokProgram) {
            return {
                ...program,
                title: storyblokProgram.title,
                creations: storyblokProgram.creations,
            }
        } else {
            return program
        }
    })

    return mergedPrograms
}
