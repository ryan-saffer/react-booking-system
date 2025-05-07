import { Table, TableBody, TableCell, TableRow } from '@ui-components/table'

export function PricingStructure() {
    return (
        <div className="m-auto my-6 flex flex-col justify-center rounded-sm border bg-slate-50">
            <div className="p-4">
                <p className="text-center font-lilita text-lg tracking-wide">Play Lab Pricing Structure</p>
                <p className="text-center text-sm text-muted-foreground">
                    Our sessions are designed to build on your child's skills week to week, with a new engaging
                    experience offered each session!
                </p>
            </div>
            <Table className="[&_td]:py-2 [&_th]:h-10">
                <colgroup>
                    <col className="w-1/2" />
                    <col className="w-1/2" />
                </colgroup>
                <TableBody className="border-t">
                    <TableRow>
                        <TableCell className="border-r text-right">1 session</TableCell>
                        <TableCell>$35</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="border-r text-right">2 or more sessions</TableCell>
                        <TableCell>5% discount</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="border-r text-right">4 or more sessions</TableCell>
                        <TableCell>10% discount</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="border-r text-right font-bold">Term enrolment - 6 sessions</TableCell>
                        <TableCell className="font-bold">20% discount</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}
