import { StoryblokClient } from '@/storyblok/storyblok-client'
import { authenticatedProcedure, router } from '@/trpc/trpc'

export const creationsRouter = router({
    getBirthdayPartyCreations: authenticatedProcedure.query(async () => {
        const storyblok = await StoryblokClient.getInstance()
        return storyblok.getBirthdayPartyCreations()
    }),
    getHolidayProgramCreations: authenticatedProcedure.query(async () => {
        const storyblok = await StoryblokClient.getInstance()
        return storyblok.getHolidayProgramCreations()
    }),
})
