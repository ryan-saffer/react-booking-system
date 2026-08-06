import type { WebsiteForm, WebsiteFormId } from '@fizz-kidz/core'

import type { AppRouter } from '@server/app/trpc/app.trpc'

import type { inferRouterOutputs } from '@trpc/server'

type WebsiteFormOutput = inferRouterOutputs<AppRouter>['websiteForms']
type WebsiteFormSubmitters = {
    [FormId in WebsiteFormId]: (input: WebsiteForm[FormId]) => Promise<WebsiteFormOutput[FormId]>
}

export async function submitWebsiteForm<FormId extends WebsiteFormId>(
    formId: FormId,
    data: WebsiteForm[NoInfer<FormId>]
): Promise<WebsiteFormOutput[FormId]> {
    const { trpc } = await import('./trpc')
    const submitters = {
        party: (input) => trpc.websiteForms.party.mutate(input),
        contact: (input) => trpc.websiteForms.contact.mutate(input),
        event: (input) => trpc.websiteForms.event.mutate(input),
        incursion: (input) => trpc.websiteForms.incursion.mutate(input),
        careers: (input) => trpc.websiteForms.careers.mutate(input),
        mailingList: (input) => trpc.websiteForms.mailingList.mutate(input),
        holidayProgramDiscount: (input) => trpc.websiteForms.holidayProgramDiscount.mutate(input),
        franchising: (input) => trpc.websiteForms.franchising.mutate(input),
    } satisfies WebsiteFormSubmitters
    const submit = submitters[formId] as unknown as (input: WebsiteForm[FormId]) => Promise<WebsiteFormOutput[FormId]>
    return submit(data)
}
