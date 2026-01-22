import type { CreationInstructions } from 'fizz-kidz'

import { env } from '../init'

import type { ClientStatus } from '../utilities/types'
import type Client from 'storyblok-js-client'



export type HolidayProgramWeek = {
    title: string
    dates: string
    programs: {
        date: Date
        slot: 'morning' | 'afternoon'
        title: string
        creations: string[]
        image: string
        color: string
    }[]
}

export class StoryblokClient {
    private static instance: StoryblokClient
    #status: ClientStatus = 'not-initialised'

    #storyblokClient: Client | null = null

    private constructor() {}

    static async getInstance() {
        if (!StoryblokClient.instance) {
            StoryblokClient.instance = new StoryblokClient()
            await StoryblokClient.instance.#initialise()
        }
        while (StoryblokClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        return StoryblokClient.instance
    }

    get #storyblok() {
        if (this.#storyblokClient) return this.#storyblokClient
        throw new Error('Storyblok client not initialised')
    }

    async #initialise() {
        this.#status = 'initialising'
        try {
            const Storyblok = (await import('storyblok-js-client')).default
            this.#storyblokClient = new Storyblok({
                accessToken: process.env.STORYBLOK_TOKEN,
                region: 'ap',
            })
        } catch (err) {
            throw { message: 'error initialising storyblok client', error: err }
        }
        this.#status = 'initialised'
    }

    async getHolidayPrograms(): Promise<HolidayProgramWeek[]> {
        const { data } = await this.#storyblok.get('cdn/stories', {
            starts_with: 'holiday_programs',
            version: env === 'prod' ? 'published' : 'draft',
        })

        return data.stories
            .sort((a: any, b: any) => (a.content.week_number < b.content.week_number ? -1 : 1))
            .map(({ content }: any) => ({
                title: content.week_title,
                dates: content.week_dates,
                programs: content.Programs.map((program: any) => ({
                    date: new Date(program.date.split(' ')[0]),
                    slot: program.time_slot,
                    title: program.title,
                    creations: [program.first_creation, program.second_creation, program.third_creation],
                    image: program.image.filename,
                    color: program.color,
                })),
            }))
    }

    async getBirthdayPartyCreations(): Promise<{ top: CreationInstructions[]; bottom: CreationInstructions[] }> {
        const { data } = await this.#storyblok.get('cdn/stories', {
            starts_with: 'creation_instructions/birthday_party_creations',
            version: env === 'prod' ? 'published' : 'draft',
            per_page: 100,
            cv: Date.now(),
        })

        return data.stories
            .sort((a: any, b: any) => (a.content.creation_name < b.content.creation_name ? -1 : 1))
            .reduce(
                (acc: { top: CreationInstructions[]; bottom: CreationInstructions[] }, curr: any) => {
                    const creation = {
                        name: curr.content.creation_name,
                        markdown: curr.content.markdown,
                    }
                    if (curr.content.show_on_top) {
                        acc.top.push(creation)
                    } else {
                        acc.bottom.push(creation)
                    }
                    return acc
                },
                { top: [], bottom: [] }
            )
    }

    async getHolidayProgramCreations(): Promise<CreationInstructions[]> {
        const { data } = await this.#storyblok.get('cdn/stories', {
            starts_with: 'creation_instructions/holiday_program_creations',
            version: env === 'prod' ? 'published' : 'draft',
            per_page: 100,
            cv: Date.now(),
        })

        return data.stories
            .sort((a: any, b: any) => (a.content.date < b.content.date ? -1 : 1))
            .map((creation: any) => ({
                name: creation.content.creation_name,
                markdown: creation.content.markdown,
            }))
    }
}
