import { PartyPopper } from 'lucide-react'
import { DateTime } from 'luxon'

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@ui-components/table'

import { useCartStore } from '../../zustand/cart-store'
import { useFormStage } from '../../zustand/form-stage'
import { useBookingForm } from '../form-schema'

export function Payment() {
    const form = useBookingForm()
    const { formStage } = useFormStage()
    const { selectedClasses, discount, subtotal, total } = useCartStore()

    const children = form.watch('children')

    if (formStage !== 'payment') return null

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Child</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Object.values(selectedClasses).map((klass) =>
                    children.map((child, idx) => (
                        <TableRow key={`${klass.id}-${idx}`}>
                            <TableCell>
                                <span className="font-bold">{klass.name}</span>
                                <br />
                                {DateTime.fromJSDate(klass.time).toFormat('EEEE MMMM d, h:mm a')}
                            </TableCell>
                            <TableCell>{child.firstName}</TableCell>
                            <TableCell className="text-right">${parseFloat(klass.price).toFixed(2)}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
            <TableFooter>
                {discount && (
                    <>
                        <TableRow>
                            <TableCell colSpan={2} className="py-2 font-light italic">
                                Subtotal
                            </TableCell>
                            <TableCell className="py-2 text-right font-light italic">${subtotal.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow className="bg-green-200 hover:bg-green-200/80">
                            <TableCell colSpan={2} className="py-2 font-light italic text-green-800">
                                <div className="flex items-center">
                                    Discount <PartyPopper className="ml-2 h-5 w-5" />
                                </div>
                            </TableCell>
                            <TableCell className="py-2 text-right font-light italic text-green-800">
                                {discount.type === 'percentage'
                                    ? `${discount.amount * 100}%`
                                    : `$${discount.amount.toFixed(2)}`}
                            </TableCell>
                        </TableRow>
                    </>
                )}
                <TableRow className="border-t">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="pt-2 text-right">${total.toFixed(2)}</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    )
}
