import { authenticatedProcedure, router } from '@/app/trpc/trpc'
import { StoryblokClient } from '@/integrations/storyblok/storyblok.client'

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
