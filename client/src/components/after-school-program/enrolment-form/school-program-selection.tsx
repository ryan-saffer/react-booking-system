import { MessageCircleWarning } from 'lucide-react'

import Loader from '@components/Shared/Loader'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { FormField } from '@ui-components/form'
import { trpc } from '@utils/trpc'

import { useEnrolmentForm } from './form-schema'
import { ProgramCard } from './program-card'
import { useSelectedProgram } from './use-selected-program'

const PROGRAMS = [
    {
        program: 'science',
        displayName: 'Science Program',
        icon: 'thermometer',
        color: '4BC5D9',
    },
    {
        program: 'art',
        displayName: 'Art & Makers Program',
        icon: 'palette',
        color: 'E91171',
    },
] as const

export function SchoolProgramSelection() {
    const form = useEnrolmentForm()

    const programType = form.watch('programType')

    const { data, isLoading, isSuccess } = trpc.acuity.getAppointmentTypes.useQuery(
        {
            category:
                import.meta.env.VITE_ENV === 'prod'
                    ? [programType === 'science' ? 'Science Club' : 'Art Program']
                    : ['TEST-art', 'TEST-science'],
            availableToBook: true,
        },
        { enabled: !!programType, staleTime: Infinity }
    )

    const { selectedProgram, selectProgram } = useSelectedProgram()

    if (!programType) {
        return (
            <>
                <FormField
                    control={form.control}
                    name="programType"
                    render={({ field }) => (
                        <>
                            <h3 className="text-center font-medium">Which program do you want to enrol into?</h3>
                            {PROGRAMS.map((it) => (
                                <ProgramTypeCard
                                    key={it.program}
                                    program={it}
                                    onSelect={() => field.onChange(it.program)}
                                />
                            ))}
                        </>
                    )}
                />
            </>
        )
    }

    return (
        <>
            <h3 className="text-lg font-medium">Select program:</h3>
            {isLoading && <Loader />}
            {isSuccess && data.length > 0 && (
                <div className="flex flex-col gap-4">
                    {data.map((program) => {
                        if ((selectedProgram && selectedProgram.id === program.id) || !selectedProgram) {
                            return (
                                <ProgramCard
                                    key={program.id + (selectedProgram?.id ? '-selected' : '')} // this little trick forces a rerender when selecting the card, which makes the 'animate-grow' animation happen again.
                                    onSelect={() => {
                                        if (selectedProgram && selectedProgram.id === program.id) {
                                            console.log('setting program to null')
                                            selectProgram(null)
                                        } else {
                                            console.log('setting program to', { program })
                                            selectProgram(program)
                                        }
                                    }}
                                    name={program.name}
                                    description={program.description}
                                    img={program.image}
                                />
                            )
                        }
                    })}
                </div>
            )}
            {isSuccess && data.length <= 0 && (
                <Alert>
                    <MessageCircleWarning className="h-4 w-4" />
                    <AlertTitle>No programs available</AlertTitle>
                    <AlertDescription>
                        Unfortunately there are no programs available to book at the moment. Come back later and check
                        again.
                    </AlertDescription>
                </Alert>
            )}
        </>
    )
}

function ProgramTypeCard({ program, onSelect }: { program: (typeof PROGRAMS)[number]; onSelect: () => void }) {
    return (
        <div
            onClick={() => onSelect()}
            className="m-auto flex min-h-16 w-80 cursor-pointer items-center gap-6 rounded-xl border border-gray-50 bg-slate-50 p-6 hover:bg-slate-100"
        >
            <img
                src={`https://api.dicebear.com/7.x/icons/svg?icon=${program.icon}&scale=100&backgroundColor=${program.color}`}
                width={60}
                alt={`${program.program} icon`}
                className="aspect-square w-12 rounded-full object-cover"
            />
            <h4 className="gotham flex-1 text-center text-lg font-medium">{program.displayName}</h4>
        </div>
    )
}
