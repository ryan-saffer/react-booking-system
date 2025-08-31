import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@ui-components/accordion'
import { Table, TableBody, TableCell, TableRow } from '@ui-components/table'
import { cn } from '@utils/tailwind'

export function PricingStructure() {
    const tiers = [
        { label: '1-3 sessions', value: '$35' },
        { label: '4-7 sessions', value: '10% discount' },
        { label: '8 sessions (term enrolment)', value: '20% discount', featured: true },
    ]

    return (
        <Accordion type="single" collapsible className="mb-4 rounded-md border">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    <div className="px-6">
                        <p className="text-center font-lilita text-lg tracking-wide">Play Lab Pricing</p>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                    <Table className="divide-y divide-gray-200 rounded-lg bg-white text-sm [&_td]:px-6 [&_td]:py-3">
                        <TableBody>
                            {tiers.map(({ label, value, featured }, i) => (
                                <TableRow
                                    key={i}
                                    className={cn(
                                        featured ? 'bg-gray-50 font-semibold text-gray-900' : 'text-gray-700'
                                    )}
                                >
                                    <TableCell>{label}</TableCell>
                                    <TableCell className="text-right">{value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
