import { PartyPopper } from 'lucide-react'
import { DateTime } from 'luxon'
import { ApplePay, CreditCard, GooglePay, PaymentForm } from 'react-square-web-payments-sdk'

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { trpc } from '@utils/trpc'

import { useCartStore } from '../../zustand/cart-store'
import { useFormStage } from '../../zustand/form-stage'
import { useBookingForm } from '../form-schema'

export function Payment() {
    const form = useBookingForm()
    const { formStage } = useFormStage()
    const { selectedClasses, discount, subtotal, total } = useCartStore()

    const children = form.watch('children')

    const { mutate, isSuccess } = trpc.square.createPayment.useMutation()

    function formatClassTime(date: Date) {
        return DateTime.fromJSDate(date).toFormat('EEEE MMMM d, h:mm a')
    }

    if (formStage !== 'payment') return null

    if (isSuccess) return <div>Success!</div>

    return (
        <>
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
                                    {formatClassTime(klass.time)}
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
                                <TableCell className="py-2 text-right font-light italic">
                                    ${subtotal.toFixed(2)}
                                </TableCell>
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
            <PaymentForm
                applicationId="sandbox-sq0idb-oH6HHICkDPQgWYXPlJQO4g"
                locationId="L834ATV1QTRQW"
                cardTokenizeResponseReceived={({ status, token }) => {
                    // TODO add verify buyer token
                    if (status === 'OK' && token) {
                        mutate({
                            token,
                            locationId: 'L834ATV1QTRQW',
                            amount: total * 100,
                            lineItems: Object.values(selectedClasses).flatMap((klass) =>
                                children.map((child) => ({
                                    name: `${child.firstName} - ${klass.name} - ${formatClassTime(klass.time)}`,
                                    amount: parseInt(klass.price) * 100,
                                    quantity: '1',
                                }))
                            ),
                            discount: discount
                                ? {
                                      ...discount,
                                      amount: discount.amount * 100,
                                      name: `Multi session discount - ${discount.amount * 100}%`,
                                  }
                                : null,
                        })
                    }
                }}
                createVerificationDetails={() => ({
                    amount: total.toFixed(2),
                    billingContact: {
                        givenName: form.getValues().parentFirstName,
                        familyName: form.getValues().parentLastName,
                        email: form.getValues().parentEmailAddress,
                        phone: form.getValues().parentPhone,
                    },
                    currencyCode: 'AUD',
                    intent: 'CHARGE',
                    customerInitiated: true,
                    sellerKeyedIn: false,
                })}
                createPaymentRequest={() => ({
                    countryCode: 'AU',
                    currencyCode: 'AUD',
                    lineItems: Object.values(selectedClasses).flatMap((klass) =>
                        children.map((child) => ({
                            amount: klass.price,
                            label: `${child.firstName} - ${klass.name} - ${formatClassTime(klass.time)}`,
                        }))
                    ),
                    discounts: discount
                        ? discount.type === 'percentage'
                            ? [{ label: 'Discount', amount: (subtotal * discount.amount).toFixed(2) }]
                            : [{ label: 'Discount', amount: (subtotal - discount.amount).toFixed(2) }]
                        : undefined,
                    total: {
                        amount: total.toFixed(2),
                        label: 'Total',
                    },
                })}
            >
                <div className="mt-8">
                    <ApplePay className="mb-4" />
                    <GooglePay className="mb-4" />
                    <CreditCard
                        buttonProps={{ css: { backgroundColor: '#AC4390', '&:hover': { backgroundColor: '#B4589C' } } }}
                    />
                </div>
            </PaymentForm>
        </>
    )
}
