import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { cn } from '@utils/tailwind'

import { PRICING_STRUCTURE } from '../../../state/cart-store'

const formatCurrency = (value: number) => {
    const hasCents = !Number.isInteger(value)
    return `$${value.toFixed(hasCents ? 2 : 0)}`
}

const formatSessionsLabel = (minSessions: number, nextMinSessions?: number) => {
    if (!nextMinSessions) {
        return `${minSessions}+ sessions`
    }

    const maxSessions = nextMinSessions - 1
    if (minSessions === maxSessions) {
        return `${minSessions} ${minSessions === 1 ? 'session' : 'sessions'}`
    }

    return `${minSessions}-${maxSessions} sessions`
}

const formatValue = (price: number, discount: number) => {
    if (discount > 0) {
        return `${formatCurrency(price)} / session`
    }

    return `${formatCurrency(price)} / session`
}

export function PricingStructure() {
    return (
        <div className="mb-4 rounded-md border bg-white">
            <Table className="text-sm">
                <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead
                            colSpan={2}
                            className="px-6 py-4 text-center font-lilita text-lg tracking-wide text-gray-900"
                        >
                            Play Lab Pricing
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 [&_td]:px-6 [&_td]:py-3">
                    {PRICING_STRUCTURE.map((tier, index) => {
                        const nextTier = PRICING_STRUCTURE[index + 1]
                        const label = formatSessionsLabel(tier.minSessions, nextTier?.minSessions)
                        const value = formatValue(tier.price, tier.discount)
                        const isFeatured = index === PRICING_STRUCTURE.length - 1

                        return (
                            <TableRow
                                key={tier.minSessions}
                                className={cn(isFeatured ? 'bg-gray-50 font-semibold text-gray-900' : 'text-gray-700')}
                            >
                                <TableCell>{label}</TableCell>
                                <TableCell className="text-right">{value}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
