import { useQuery } from '@tanstack/react-query'
import Fuse from 'fuse.js'
import { useDeferredValue, useState } from 'react'
import Markdown from 'react-markdown'

import type { CreationInstructionGroup, CreationInstructions } from 'fizz-kidz'

import Loader from '@components/Shared/Loader'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@ui-components/accordion'
import { Input } from '@ui-components/input'
import { useTRPC } from '@utils/trpc'

import { markdownComponents } from './markdown-components'

type SearchableCreation = {
    packageIndex: number
    creationIndex: number
    name: string
}

export const PartyCreationsPage = () => {
    const trpc = useTRPC()
    const { data, isPending, isSuccess } = useQuery(trpc.creations.getBirthdayPartyCreations.queryOptions())
    const [searchTerm, setSearchTerm] = useState('')
    const deferredSearchTerm = useDeferredValue(searchTerm)
    const searchQuery = deferredSearchTerm.trim()

    const renderAccordion = (creations: CreationInstructions[]) => {
        return (
            <Accordion
                type="multiple"
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
                {creations.map((creation) => (
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
        )
    }

    const getVisiblePackages = (packages: CreationInstructionGroup[]) => {
        if (!searchQuery) return packages

        const searchableCreations = packages.flatMap((partyPackage, packageIndex) =>
            partyPackage.creations.map((creation, creationIndex) => ({
                packageIndex,
                creationIndex,
                name: creation.name,
            }))
        )
        const fuse = new Fuse<SearchableCreation>(searchableCreations, {
            keys: ['name'],
            threshold: 0.35,
            ignoreLocation: true,
        })
        const matchedCreationKeys = new Set(
            fuse.search(searchQuery).map(({ item }) => `${item.packageIndex}:${item.creationIndex}`)
        )

        return packages
            .map((partyPackage, packageIndex) => ({
                ...partyPackage,
                creations: partyPackage.creations.filter((_, creationIndex) =>
                    matchedCreationKeys.has(`${packageIndex}:${creationIndex}`)
                ),
            }))
            .filter((partyPackage) => partyPackage.creations.length > 0)
    }

    const visiblePackages = isSuccess ? getVisiblePackages(data) : []

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
                {isPending && <Loader />}

                {isSuccess && (
                    <>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <label
                                htmlFor="creation-search"
                                className="mb-2 block text-sm font-semibold text-slate-900"
                            >
                                Search creations
                            </label>
                            <Input
                                id="creation-search"
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by creation name..."
                                className="bg-white"
                            />
                        </div>
                        <div className="flex flex-col gap-6">
                            {visiblePackages.map((partyPackage) => (
                                <section key={partyPackage.name} className="flex flex-col gap-3">
                                    <h2 className="lilita m-0 text-2xl text-slate-900">{partyPackage.name}</h2>
                                    {renderAccordion(partyPackage.creations)}
                                </section>
                            ))}
                            {visiblePackages.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
                                    No creations match your search.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
