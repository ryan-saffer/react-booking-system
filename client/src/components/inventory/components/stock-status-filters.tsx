import { Button } from '@ui-components/button'
import { cn } from '@utils/tailwind'

import type { StockStatusFilter } from '../types'

export function StockStatusFilters({
    value,
    totalCount,
    runningLowCount,
    needsCountCount,
    notRunningLowCount,
    onChange,
}: {
    value: StockStatusFilter
    totalCount: number
    runningLowCount: number
    needsCountCount: number
    notRunningLowCount: number
    onChange: (value: StockStatusFilter) => void
}) {
    const filters: { value: StockStatusFilter; label: string; count: number; className?: string }[] = [
        { value: 'all', label: 'All stock', count: totalCount },
        {
            value: 'running-low',
            label: 'Running low',
            count: runningLowCount,
            className: 'data-[active=true]:border-red-200 data-[active=true]:bg-red-50 data-[active=true]:text-red-700',
        },
        {
            value: 'needs-count',
            label: 'Needs count',
            count: needsCountCount,
            className:
                'data-[active=true]:border-amber-200 data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700',
        },
        {
            value: 'not-running-low',
            label: 'Healthy',
            count: notRunningLowCount,
            className:
                'data-[active=true]:border-emerald-200 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700',
        },
    ]

    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
                <Button
                    key={filter.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    data-active={value === filter.value}
                    className={cn(
                        'h-8 rounded-full border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950 data-[active=true]:border-[#00c2e3]/30 data-[active=true]:bg-[#e9fbff] data-[active=true]:text-[#007f93]',
                        filter.className
                    )}
                    onClick={() => onChange(filter.value)}
                >
                    {filter.label}
                    <span className="ml-2 rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-500">
                        {filter.count}
                    </span>
                </Button>
            ))}
        </div>
    )
}
