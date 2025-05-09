import { Separator } from '@ui-components/separator'
import { Table, TableBody, TableCell, TableRow } from '@ui-components/table'
import { cn } from '@utils/tailwind'

export function PricingStructure() {
    const tiers = [
        { label: '1 session', value: '$35' },
        { label: '2+ sessions', value: '5% discount' },
        { label: '4+ sessions', value: '10% discount' },
        { label: 'Term enrolment (6 sessions)', value: '20% discount', featured: true },
    ]

    return (
        <div className="mx-auto my-8 max-w-md rounded-md border">
            <div className="px-6 py-4">
                <p className="text-center font-lilita text-lg tracking-wide">Play Lab Pricing</p>
            </div>
            <Separator />
            <Table className="divide-y divide-gray-200 rounded-lg bg-white text-sm shadow [&_td]:px-6 [&_td]:py-3">
                <TableBody>
                    {tiers.map(({ label, value, featured }, i) => (
                        <TableRow
                            key={i}
                            className={cn(featured ? 'bg-gray-50 font-semibold text-gray-900' : 'text-gray-700')}
                        >
                            <TableCell>{label}</TableCell>
                            <TableCell className="text-right">{value}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
