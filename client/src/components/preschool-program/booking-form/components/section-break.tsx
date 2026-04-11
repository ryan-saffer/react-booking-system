import { Separator } from '@ui-components/separator'

export function SectionBreak({ title }: { title: string }) {
    return (
        <div className="flex items-center">
            <Separator className="mr-4 w-fit grow" />
            <h3 className="text-lg font-medium">{title}</h3>
            <Separator className="ml-4 w-fit grow" />
        </div>
    )
}
