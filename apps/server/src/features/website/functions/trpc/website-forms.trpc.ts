import {
    CareersWebsiteFormSchema,
    ContactWebsiteFormSchema,
    EventWebsiteFormSchema,
    FranchisingWebsiteFormSchema,
    HolidayProgramDiscountWebsiteFormSchema,
    IncursionWebsiteFormSchema,
    MailingListWebsiteFormSchema,
    PartyWebsiteFormSchema,
} from '@fizz-kidz/core'

import { publicProcedure, router } from '@/app/trpc/trpc'
import { processWebsiteFormSubmission } from '@/features/website/core/process-website-form-submission'

const success = { success: true } as const

export const websiteFormsRouter = router({
    party: publicProcedure.input(PartyWebsiteFormSchema).mutation(async ({ input }) => {
        await processWebsiteFormSubmission({ formId: 'party', data: input })
        return success
    }),
    contact: publicProcedure.input(ContactWebsiteFormSchema).mutation(async ({ input }) => {
        await processWebsiteFormSubmission({ formId: 'contact', data: input })
        return success
    }),
    event: publicProcedure.input(EventWebsiteFormSchema).mutation(async ({ input }) => {
        await processWebsiteFormSubmission({ formId: 'event', data: input })
        return success
    }),
    incursion: publicProcedure.input(IncursionWebsiteFormSchema).mutation(async ({ input }) => {
        await processWebsiteFormSubmission({ formId: 'incursion', data: input })
        return success
    }),
    careers: publicProcedure.input(CareersWebsiteFormSchema).mutation(async ({ input }) => {
        await processWebsiteFormSubmission({ formId: 'careers', data: input })
        return success
    }),
    mailingList: publicProcedure.input(MailingListWebsiteFormSchema).mutation(async ({ input }) => {
        await processWebsiteFormSubmission({ formId: 'mailingList', data: input })
        return success
    }),
    holidayProgramDiscount: publicProcedure
        .input(HolidayProgramDiscountWebsiteFormSchema)
        .mutation(({ input }) => processWebsiteFormSubmission({ formId: 'holidayProgramDiscount', data: input })),
    franchising: publicProcedure.input(FranchisingWebsiteFormSchema).mutation(async ({ input }) => {
        await processWebsiteFormSubmission({ formId: 'franchising', data: input })
        return success
    }),
})
