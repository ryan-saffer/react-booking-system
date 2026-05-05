import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { BarChart3, CalendarIcon } from 'lucide-react'
import { useState } from 'react'

import type { Studio, StudioOrMaster } from 'fizz-kidz'

import { useOrg } from '@components/Session/use-org'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Calendar } from '@ui-components/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui-components/card'
import { Input } from '@ui-components/input'
import { Label } from '@ui-components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { getOrgName } from '@utils/studioUtils'
import { cn } from '@utils/tailwind'
import { useTRPC } from '@utils/trpc'

import type { FormEvent } from 'react'
import type { DateRange } from 'react-day-picker'

type CapacityReportResult = {
    startDate: string
    endDate: string
    studio: StudioOrMaster
    results: CapacityReportStudioResult[]
}

type CapacityReportStudioResult = {
    studio: Studio
    bookedSlots: number
    availableSlots: number
    utilisationPercentage: number
}

const formatPercent = (value: number) =>
    new Intl.NumberFormat('en-AU', {
        maximumFractionDigits: 1,
        minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    }).format(value)

const formatReportDate = (value: string) => format(new Date(`${value}T00:00:00`), 'd MMMM yyyy')

export function PartyCapacityUtilisationReport() {
    const trpc = useTRPC()
    const { currentOrg } = useOrg()
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [availableSlots, setAvailableSlots] = useState('')
    const [result, setResult] = useState<CapacityReportResult | null>(null)

    const generateCapacityReport = useMutation(trpc.reports.generateCapacityReport.mutationOptions())

    const parsedAvailableSlots = Number(availableSlots)
    const canRunReport = Boolean(
        currentOrg && startDate && endDate && Number.isInteger(parsedAvailableSlots) && parsedAvailableSlots > 0
    )

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!currentOrg || !canRunReport) return

        try {
            const report = await generateCapacityReport.mutateAsync({
                startDate,
                endDate,
                availableSlots: parsedAvailableSlots,
                studio: currentOrg,
            })
            setResult(report)
        } catch {
            setResult(null)
        }
    }

    return (
        <Card className="overflow-hidden rounded-3xl border-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
            <CardHeader className="bg-[#fff7fb] text-slate-950 ring-1 ring-inset ring-[#B14594]/10">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <BarChart3 className="h-5 w-5 text-[#B14594]" /> Party Capacity Utilisation
                </CardTitle>
                <CardDescription className="text-slate-600">
                    Count in-studio birthday parties over a date range and compare them to the available booking slots
                    you enter.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_0.9fr]">
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">
                        Reporting on:{' '}
                        <span className="font-bold text-slate-950">
                            {currentOrg ? getOrgName(currentOrg) : 'No organisation selected'}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="capacity-date-range">Date range</Label>
                        <DateRangePicker
                            id="capacity-date-range"
                            startDate={startDate}
                            endDate={endDate}
                            onChange={({ startDate, endDate }) => {
                                setStartDate(startDate)
                                setEndDate(endDate)
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="capacity-available-slots">
                            Available booking slots{currentOrg === 'master' ? ' per studio' : ''}
                        </Label>
                        <Input
                            id="capacity-available-slots"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Example: 20"
                            value={availableSlots}
                            onChange={(event) => setAvailableSlots(event.target.value)}
                        />
                        <p className="m-0 text-xs text-slate-500">
                            {currentOrg === 'master'
                                ? 'Enter the slots available for each studio in the selected date range.'
                                : 'Enter the total slots available for the selected date range and organisation.'}
                        </p>
                    </div>

                    {generateCapacityReport.isError ? (
                        <Alert variant="destructive">
                            <AlertTitle>Unable to run report</AlertTitle>
                            <AlertDescription>
                                Check the date range and available slots, then try again.
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    <Button
                        type="submit"
                        className="w-full bg-[#B14594] text-white hover:bg-[#9f3d86] sm:w-fit"
                        disabled={!canRunReport || generateCapacityReport.isPending}
                    >
                        {generateCapacityReport.isPending ? 'Running report...' : 'Run report'}
                    </Button>
                </form>

                <CapacityReportSummary result={result} currentOrg={currentOrg} />
            </CardContent>
        </Card>
    )
}

function CapacityReportSummary({
    result,
    currentOrg,
}: {
    result: CapacityReportResult | null
    currentOrg: StudioOrMaster | null
}) {
    if (!result) {
        return (
            <div className="flex min-h-72 flex-col justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="m-0 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">No report yet</p>
                <p className="m-0 mt-2 text-sm text-slate-600">
                    Choose a date range and available slots to see utilisation for{' '}
                    {currentOrg ? getOrgName(currentOrg) : 'the selected organisation'}.
                </p>
            </div>
        )
    }

    const isMasterReport = result.studio === 'master'

    return (
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-br from-[#00c2e3] to-[#B14594] p-6 text-white shadow-lg">
            <div className="flex flex-col gap-2">
                <p className="m-0 text-sm font-bold uppercase tracking-[0.2em] text-white/70">Capacity reached</p>
                {!isMasterReport && result.results[0] ? (
                    <p className="m-0 text-6xl font-black leading-none sm:text-7xl">
                        {formatPercent(result.results[0].utilisationPercentage)}%
                    </p>
                ) : null}
                <p className="m-0 text-sm text-white/80">
                    {getOrgName(result.studio)} from {formatReportDate(result.startDate)} to{' '}
                    {formatReportDate(result.endDate)}
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {result.results.map((studioResult) => (
                    <StudioResultRow key={studioResult.studio} result={studioResult} showStudio={isMasterReport} />
                ))}
            </div>
        </div>
    )
}

function StudioResultRow({ result, showStudio }: { result: CapacityReportStudioResult; showStudio: boolean }) {
    return (
        <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="m-0 text-xs font-semibold uppercase tracking-wide text-white/75">
                        {showStudio ? getOrgName(result.studio) : 'In-studio bookings'}
                    </p>
                    <p className="m-0 mt-1 text-sm text-white/75">
                        {result.bookedSlots} of {result.availableSlots} slots booked
                    </p>
                </div>
                <p className="m-0 text-3xl font-black">{formatPercent(result.utilisationPercentage)}%</p>
            </div>
        </div>
    )
}

function DateRangePicker({
    id,
    startDate,
    endDate,
    onChange,
}: {
    id: string
    startDate: string
    endDate: string
    onChange: (value: { startDate: string; endDate: string }) => void
}) {
    const [open, setOpen] = useState(false)
    const selectedRange: DateRange | undefined = startDate
        ? {
              from: new Date(`${startDate}T00:00:00`),
              to: endDate ? new Date(`${endDate}T00:00:00`) : undefined,
          }
        : undefined

    const buttonLabel = (() => {
        if (selectedRange?.from && selectedRange.to) {
            return `${format(selectedRange.from, 'PPP')} - ${format(selectedRange.to, 'PPP')}`
        }

        if (selectedRange?.from) {
            return `${format(selectedRange.from, 'PPP')} - Pick end date`
        }

        return 'Pick date range'
    })()

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedRange?.from && 'text-muted-foreground'
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {buttonLabel}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    defaultMonth={selectedRange?.from}
                    selected={selectedRange}
                    onSelect={(range) => {
                        onChange({
                            startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                            endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
                        })
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
