import { Location, capitalise } from 'fizz-kidz'
import { MessageCircleWarning } from 'lucide-react'

import Loader from '@components/Shared/Loader'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { trpc } from '@utils/trpc'

import { useEnrolmentForm } from './form-schema'
import { ProgramCard } from './program-card'
import { useSelectedProgram } from './use-selected-program'

export function StudioProgramSelection() {
    const form = useEnrolmentForm()

    const studio = form.watch('studio')

    const { data, isLoading, isSuccess } = trpc.acuity.getAppointmentTypes.useQuery(
        { category: [`science-${studio!}` as const] },
        { enabled: !!studio, staleTime: Infinity }
    )

    const { selectedProgram, selectProgram } = useSelectedProgram()

    if (!studio) {
        return (
            <FormField
                control={form.control}
                name="studio"
                render={({ field }) => (
                    <FormItem className="space-y-4">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormLabel className="text-md">Which studio would you like to attend?</FormLabel>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a studio" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.values(Location).map((location) => (
                                    <SelectItem value={location} key={location}>
                                        {capitalise(location)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    }

    return (
        <>
            <h3 className="text-lg font-medium">Select program:</h3>
            {isLoading && <Loader />}
            {isSuccess && data.length > 0 && (
                <>
                    {data.map((program) => {
                        if ((selectedProgram && selectedProgram.id === program.id) || !selectedProgram) {
                            return (
                                <ProgramCard
                                    key={program.id + (program.id ? '-selected' : '')} // this little trick forces a rerender when selecting the card, which makes the 'animate-grow' animation happen again.
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
