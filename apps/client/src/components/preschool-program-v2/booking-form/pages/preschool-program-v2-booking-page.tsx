import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import Root from '@components/Shared/Root'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@ui-components/card'
import { Form } from '@ui-components/form'
import { Separator } from '@ui-components/separator'

import { Stepper } from '../components/common/stepper'
import { CustomerDetails } from '../components/customer-details'
import { Payment } from '../components/payment/payment'
import { SessionSelection } from '../components/session-selection'
import { defaultValues, formSchema, type PreschoolProgramV2BookingForm } from '../state/form-schema'
import { useFormStage } from '../state/form-stage-store'

export function PreschoolProgramV2BookingPage() {
    const formStage = useFormStage((store) => store.formStage)
    const form = useForm<PreschoolProgramV2BookingForm>({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    return (
        <Root logoSize="sm">
            <div className="w-full">
                <h1 className="text-center font-lilita text-2xl font-extralight">Preschool Program Booking</h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Book and pay for preschool sessions in advance.
                </p>
                <Separator className="my-4" />
                <Form {...form}>
                    <Stepper />
                    <SessionSelection />
                    <CustomerDetails />
                    <Payment />
                    {formStage === 'success' ? <Success /> : null}
                </Form>
            </div>
        </Root>
    )
}

function Success() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Booking confirmed</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="success">
                    <AlertTitle>Your preschool sessions are booked</AlertTitle>
                    <AlertDescription>
                        You should receive your Square receipt shortly. Keep your Acuity confirmation links handy if you
                        need to reschedule a session.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
}
