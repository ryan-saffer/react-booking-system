import type { AcuityTypes } from 'fizz-kidz'
import { STUDIOS, capitalise } from 'fizz-kidz'
import { MessageCircleWarning } from 'lucide-react'

import Loader from '@components/Shared/Loader'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { FormField, FormItem, FormMessage } from '@ui-components/form'
import { SelectContent, SelectForm, SelectItem, SelectValue } from '@ui-components/select'
import { Separator } from '@ui-components/separator'
import { useTRPC } from '@utils/trpc'

import { useEnrolmentForm } from './form-schema'
import { ProgramCard } from './program-card'
import { useSelectedProgram } from './use-selected-program'

import { useQuery } from '@tanstack/react-query'
import { useWatch } from 'react-hook-form'

export function StudioProgramSelection() {
    const trpc = useTRPC()
    const form = useEnrolmentForm()

    const studio = useWatch({ control: form.control, name: 'studio' })

    const { data, isPending, isSuccess } = useQuery(
        trpc.acuity.getAppointmentTypes.queryOptions(
            {
                category:
                    import.meta.env.VITE_ENV === 'prod'
                        ? [`science-${studio!}` as const, `art-${studio!}` as const]
                        : ['test-after-school-in-studio'],
                availableToBook: true,
            },
            { enabled: !!studio, staleTime: Infinity }
        )
    )

    const { selectedProgram, selectProgram } = useSelectedProgram()

    if (!studio) {
        return (
            <FormField
                control={form.control}
                name="studio"
                render={({ field }) => (
                    <FormItem className="space-y-4">
                        <SelectForm
                            label="Which studio would you like to attend?"
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <SelectValue placeholder="Select a studio" />
                            <SelectContent>
                                {STUDIOS.map((studio) => (
                                    <SelectItem value={studio} key={studio}>
                                        {capitalise(studio)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectForm>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    }

    function renderProgramCategory(category: 'art' | 'science', programs: AcuityTypes.Api.AppointmentType[]) {
        if (programs.length > 0) {
            return (
                <>
                    {selectedProgram === null && (
                        <div className="flex items-center">
                            <Separator className="mr-4 w-fit grow" />
                            <h3 className="text-lg font-medium">{capitalise(category)} Programs</h3>
                            <Separator className="ml-4 w-fit grow" />
                        </div>
                    )}
                    {programs.map((program) => {
                        if ((selectedProgram && selectedProgram.id === program.id) || !selectedProgram) {
                            return (
                                <ProgramCard
                                    key={program.id + (selectedProgram?.id ? '-selected' : '')} // this little trick forces a rerender when selecting the card, which makes the 'animate-grow' animation happen again.
                                    onSelect={() => {
                                        if (selectedProgram && selectedProgram.id === program.id) {
                                            selectProgram(null)
                                        } else {
                                            selectProgram(program)
                                        }
                                    }}
                                    name={program.name}
                                    description={program.description}
                                />
                            )
                        }
                    })}
                </>
            )
        }
        return null
    }

    return (
        <>
            <h3 className="text-lg font-medium">Select program:</h3>
            {isPending && <Loader />}
            {isSuccess && data.length > 0 && (
                <>
                    {import.meta.env.VITE_ENV === 'prod' ? (
                        <>
                            {renderProgramCategory(
                                'science',
                                data.filter((it) => it.category.includes('science'))
                            )}
                            {renderProgramCategory(
                                'art',
                                data.filter((it) => it.category.includes('art'))
                            )}
                        </>
                    ) : (
                        // for testing, there is no breakdown by studio and category. just render all the test programs.
                        renderProgramCategory('science', data)
                    )}
                </>
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
