import { MapPin } from 'lucide-react'

import { capitalise } from 'fizz-kidz'
import type { StudioOrTest } from 'fizz-kidz'

import { FormItem, FormLabel } from '@ui-components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'

import { useEnrolmentStore } from '../state/enrolment-store'

type Props = {
    studios: StudioOrTest[]
}

export function StudioSelector({ studios }: Props) {
    const selectedStudio = useEnrolmentStore((store) => store.selectedStudio)
    const setSelectedStudio = useEnrolmentStore((store) => store.setSelectedStudio)

    return (
        <FormItem className="mb-4 space-y-4">
            <Select
                value={selectedStudio || undefined}
                onValueChange={(value) => setSelectedStudio(value as StudioOrTest)}
            >
                <FormLabel className="text-lg flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-violet-800" />
                    Which studio would you like to attend?
                </FormLabel>
                <SelectTrigger>
                    <SelectValue placeholder="Select a studio" />
                </SelectTrigger>
                <SelectContent>
                    {studios.map((studio) => (
                        <SelectItem key={studio} value={studio}>
                            {capitalise(studio)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FormItem>
    )
}
