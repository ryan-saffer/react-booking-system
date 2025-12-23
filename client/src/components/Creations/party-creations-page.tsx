import Markdown from 'react-markdown'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@ui-components/accordion'

import { markdownComponents } from './markdown-components'
import { slimeActivator, taylorSwift } from './party-creations-markdown'
import { trpc } from '@utils/trpc'

export const PartyCreationsPage = () => {
    const { data } = trpc.creations.getBirthdayPartyCreations.useQuery(undefined, { cacheTime: 0 })

    return (
        <div className="twp min-h-full bg-slate-50 px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
                <header className="flex flex-col gap-2">
                    <p className="lilita m-0 text-sm uppercase tracking-[0.2em] text-[#ff4f9c]">Birthday parties</p>
                    <h1 className="lilita m-0 text-3xl text-slate-900 sm:text-4xl">Creation instructions</h1>
                    <p className="m-0 max-w-2xl text-sm text-slate-600 sm:text-base">
                        Open a card to see ingredients, steps, and Fizz tips for party creations.
                    </p>
                </header>

                <Accordion
                    type="multiple"
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <AccordionItem value="swiftie" className="border-b border-slate-200">
                        <AccordionTrigger className="px-4 text-left text-base font-semibold text-slate-900 sm:px-6">
                            Taylor Swift 'Swiftie' Parties
                        </AccordionTrigger>
                        <AccordionContent className="px-4 text-base leading-relaxed sm:px-6">
                            <Markdown components={markdownComponents}>{taylorSwift}</Markdown>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="slime-activator" className="border-b border-slate-200">
                        <AccordionTrigger className="px-4 text-left text-base font-semibold text-slate-900 sm:px-6">
                            {slimeActivator.name}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 text-base leading-relaxed sm:px-6">
                            <Markdown components={markdownComponents}>{slimeActivator.markdown}</Markdown>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Accordion
                    type="multiple"
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    {data?.map((creation) => (
                        <AccordionItem key={creation.name} value={creation.name} className="border-b border-slate-200">
                            <AccordionTrigger className="px-4 text-left text-base font-semibold text-slate-900 sm:px-6">
                                {creation.name}
                            </AccordionTrigger>
                            <AccordionContent className="px-4 text-base leading-relaxed sm:px-6">
                                <Markdown components={markdownComponents}>{creation.markdown}</Markdown>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    )
}
