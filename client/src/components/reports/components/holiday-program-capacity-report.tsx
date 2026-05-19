import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarDays, ExternalLink, RefreshCw, UsersRound } from 'lucide-react'

import type { Studio, StudioOrMaster } from 'fizz-kidz'

import { useOrg } from '@components/Session/use-org'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@ui-components/accordion'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Badge } from '@ui-components/badge'
import { Button } from '@ui-components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui-components/card'
import { Progress } from '@ui-components/progress'
import { Skeleton } from '@ui-components/skeleton'
import { getOrgName } from '@utils/studioUtils'
import { cn } from '@utils/tailwind'
import { useTRPC } from '@utils/trpc'

type HolidayProgramCapacityReportResult = {
    studio: StudioOrMaster
    generatedAt: string
    overall: HolidayProgramCapacitySummary
    studios: HolidayProgramCapacityStudioResult[]
}

type HolidayProgramCapacitySummary = {
    bookedSpots: number
    totalCapacity: number
    slotsAvailable: number
    utilisationPercentage: number
}

type HolidayProgramCapacityStudioResult = HolidayProgramCapacitySummary & {
    studio: Studio
    classes: HolidayProgramCapacityClassResult[]
}

type HolidayProgramCapacityClassResult = HolidayProgramCapacitySummary & {
    classId: number
    appointmentTypeId: number
    calendarId: number
    studio: Studio
    name: string
    title?: string
    time: string
}

const formatPercent = (value: number) =>
    new Intl.NumberFormat('en-AU', {
        maximumFractionDigits: 1,
        minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    }).format(value)

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

const formatClassTime = (value: string) => format(new Date(value), 'EEE d MMM, h:mm a')

const getAcuityClassUrl = (classId: number) => {
    const params = new URLSearchParams({
        action: 'detailAvailableGroup',
        id: classId.toString(),
    })

    return `https://secure.acuityscheduling.com/appointments.php?${params.toString()}`
}

export function HolidayProgramCapacityReport() {
    const trpc = useTRPC()
    const { currentOrg } = useOrg()

    const reportQuery = useQuery(
        trpc.reports.generateHolidayProgramCapacityReport.queryOptions(
            { studio: currentOrg ?? 'master' },
            { enabled: Boolean(currentOrg) }
        )
    )

    const report = reportQuery.data ?? null

    return (
        <Card className="overflow-hidden rounded-3xl border-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
            <CardHeader className="bg-[#effcff] text-slate-950 ring-1 ring-inset ring-[#00c2e3]/15">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <UsersRound className="h-5 w-5 text-[#00a9c7]" /> Holiday Program Capacity
                        </CardTitle>
                        <CardDescription className="max-w-3xl text-slate-600">
                            See each upcoming holiday program class by studio, including booked children, total
                            capacity, remaining spots, and utilisation.
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2 rounded-full bg-white sm:w-fit"
                        disabled={!currentOrg || reportQuery.isFetching}
                        onClick={() => reportQuery.refetch()}
                    >
                        <RefreshCw className={cn('h-4 w-4', reportQuery.isFetching && 'animate-spin')} /> Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 p-6">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">
                    Reporting on:{' '}
                    <span className="font-bold text-slate-950">
                        {currentOrg ? getOrgName(currentOrg) : 'No organisation selected'}
                    </span>
                    {report ? (
                        <span className="ml-2 text-xs text-slate-500">
                            Updated {format(new Date(report.generatedAt), 'd MMM yyyy, h:mm a')}
                        </span>
                    ) : null}
                </div>

                {reportQuery.isPending ? <HolidayProgramCapacitySkeleton /> : null}

                {reportQuery.isError ? (
                    <Alert variant="destructive">
                        <AlertTitle>Unable to load holiday program capacity</AlertTitle>
                        <AlertDescription>Refresh the report or try again later.</AlertDescription>
                    </Alert>
                ) : null}

                {report && !reportQuery.isPending ? <HolidayProgramCapacitySummary report={report} /> : null}
            </CardContent>
        </Card>
    )
}

function HolidayProgramCapacitySummary({ report }: { report: HolidayProgramCapacityReportResult }) {
    const hasClasses = report.studios.some((studio) => studio.classes.length > 0)
    const classCount = report.studios.reduce((total, studio) => total + studio.classes.length, 0)

    if (!hasClasses) {
        return (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <CalendarDays className="h-8 w-8 text-slate-300" />
                <p className="m-0 mt-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">No classes found</p>
                <p className="m-0 mt-2 max-w-md text-sm text-slate-600">
                    There are no upcoming holiday program classes in Acuity for {getOrgName(report.studio)}.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5">
            <OverallCapacityCard summary={report.overall} classCount={classCount} />
            <Accordion type="multiple" className="grid gap-4">
                {report.studios
                    .filter((studio) => studio.classes.length > 0)
                    .map((studio) => (
                        <StudioCapacityCard
                            key={studio.studio}
                            studio={studio}
                            showStudio={report.studio === 'master'}
                        />
                    ))}
            </Accordion>
        </div>
    )
}

function OverallCapacityCard({ summary, classCount }: { summary: HolidayProgramCapacitySummary; classCount: number }) {
    return (
        <div className="rounded-3xl bg-gradient-to-br from-[#00c2e3] to-[#B14594] p-5 text-white shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="m-0 text-xs font-bold uppercase tracking-[0.2em] text-white/70">Overall capacity</p>
                    <p className="m-0 mt-1 text-4xl font-black leading-none sm:text-5xl">
                        {formatPercent(summary.utilisationPercentage)}%
                    </p>
                </div>
                <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[24rem]">
                    <MetricPill label="Booked" value={`${summary.bookedSpots}/${summary.totalCapacity}`} />
                    <MetricPill label="Remaining" value={summary.slotsAvailable.toString()} />
                    <MetricPill label="Classes" value={classCount.toString()} />
                </div>
            </div>
            <Progress className="mt-4 h-2 bg-white/25" value={clampPercent(summary.utilisationPercentage)} />
        </div>
    )
}

function MetricPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-white/15 px-3 py-2 ring-1 ring-white/20">
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-white/70">{label}</p>
            <p className="m-0 mt-0.5 text-xl font-black">{value}</p>
        </div>
    )
}

function StudioCapacityCard({
    studio,
    showStudio,
}: {
    studio: HolidayProgramCapacityStudioResult
    showStudio: boolean
}) {
    return (
        <AccordionItem
            value={studio.studio}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
            <AccordionTrigger className="bg-slate-50 px-5 py-5 text-left hover:no-underline">
                <div className="flex flex-1 flex-col gap-4 pr-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            {showStudio ? getOrgName(studio.studio) : 'Selected studio'}
                        </p>
                        <h3 className="m-0 mt-1 text-2xl font-black text-slate-950">
                            {studio.bookedSpots}/{studio.totalCapacity} booked
                        </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge className="border-[#00c2e3]/20 bg-[#00c2e3]/10 text-[#007f96] hover:bg-[#00c2e3]/10">
                            {formatPercent(studio.utilisationPercentage)}% full
                        </Badge>
                        <Badge variant="outline">{studio.slotsAvailable} spots left</Badge>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
                <div className="flex flex-col divide-y divide-slate-100">
                    {studio.classes.map((klass) => (
                        <ClassCapacityRow key={klass.classId} klass={klass} />
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

function ClassCapacityRow({ klass }: { klass: HolidayProgramCapacityClassResult }) {
    const isFull = klass.slotsAvailable === 0 && klass.totalCapacity > 0

    return (
        <div className="grid gap-3 p-5 lg:grid-cols-[1fr_10rem_12rem_9rem] lg:items-center">
            <div>
                <p className="m-0 text-sm font-bold text-slate-950">{formatClassTime(klass.time)}</p>
                <p className="m-0 mt-1 text-sm text-slate-500">{klass.title ?? klass.name}</p>
            </div>
            <div className="flex items-center gap-2 lg:justify-end">
                <span className="text-2xl font-black text-slate-950">
                    {klass.bookedSpots}/{klass.totalCapacity}
                </span>
                <span className="text-xs font-semibold uppercase text-slate-400">booked</span>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide">
                    <span className={isFull ? 'text-[#B14594]' : 'text-slate-500'}>
                        {isFull ? 'Full' : `${klass.slotsAvailable} left`}
                    </span>
                    <span className="text-slate-500">{formatPercent(klass.utilisationPercentage)}%</span>
                </div>
                <Progress className="h-2 bg-slate-100" value={clampPercent(klass.utilisationPercentage)} />
            </div>
            <Button asChild variant="outline" className="w-full gap-2 rounded-full lg:justify-self-end">
                <a href={getAcuityClassUrl(klass.classId)} target="_blank" rel="noreferrer">
                    Open in Acuity <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </Button>
        </div>
    )
}

function HolidayProgramCapacitySkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
        </div>
    )
}
