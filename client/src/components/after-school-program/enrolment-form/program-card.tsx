import { Card, CardContent, CardHeader, CardTitle } from '@ui-components/card'

export function ProgramCard({
    onSelect,
    name,
    description,
    img,
}: {
    onSelect: () => void
    name: string
    description: string
    img?: string
}) {
    return (
        <Card
            onClick={() => {
                onSelect()
                window.scrollTo({ top: 0 })
            }}
            className="animate-grow cursor-pointer shadow-sm hover:bg-slate-50"
        >
            <CardHeader>
                <CardTitle className="text-md font-medium">{name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between">
                    <div>
                        {description.split('\n').map((line, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">
                                {line}
                            </p>
                        ))}
                    </div>
                    {img && (
                        <div className="p-4">
                            <img src={img} className="h-full max-w-28 object-contain" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
