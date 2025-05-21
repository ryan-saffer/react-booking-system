import { Button, Checkbox } from 'antd'
import { AcuityConstants, AcuityTypes } from 'fizz-kidz'
import React, { Dispatch, SetStateAction, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Loader from '@components/Shared/Loader'
import { styled } from '@mui/material/styles'
import { trpc } from '@utils/trpc'

import { Form } from '../../pages/customer-booking-page'
import { TermsCheckbox, TermsCheckboxHandle } from './TermsCheckbox'

const PREFIX = 'FreeConfirmationButton'

const classes = {
    primaryButton: `${PREFIX}-primaryButton`,
}

const Root = styled('div')({
    [`& .${classes.primaryButton}`]: {
        background: 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)',
        borderColor: 'white',
    },
})

type Props = {
    appointmentTypeId: AcuityConstants.AppointmentTypeValue
    form: Form
    selectedClasses: AcuityTypes.Client.Class[]
    discountCode: string
    setError: Dispatch<SetStateAction<boolean>>
}

const FreeConfirmationButton: React.FC<Props> = ({
    appointmentTypeId,
    form,
    selectedClasses,
    discountCode,
    setError,
}) => {
    const navigate = useNavigate()

    const termsRef = useRef<TermsCheckboxHandle>(null)
    const submitButtonRef = useRef<HTMLButtonElement>(null)

    const [joinMailingList, setJoinMailingList] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const scheduleProgramsMutation = trpc.holidayPrograms.scheduleFreeHolidayPrograms.useMutation()

    const handleSubmit = async () => {
        setTimeout(() => submitButtonRef.current?.blur())
        if (!termsRef.current?.isChecked()) {
            termsRef.current?.showWarning()
            return
        }

        setSubmitting(true)
        try {
            await scheduleProgramsMutation.mutateAsync(
                selectedClasses.flatMap((klass) =>
                    form.children.map((child) => ({
                        appointmentTypeId: klass.appointmentTypeID,
                        dateTime: klass.time,
                        calendarId: klass.calendarID,
                        parentFirstName: form.parentFirstName,
                        parentLastName: form.parentLastName,
                        parentPhone: form.phone,
                        parentEmail: form.parentEmail,
                        emergencyContactName: form.emergencyContact,
                        emergencyContactPhone: form.emergencyPhone,
                        childName: child.childName,
                        childAge: child.childAge.toISOString(),
                        childAllergies: child.allergies ?? '',
                        childAdditionalInfo: child.additionalInfo,
                        discountCode: discountCode,
                        amountCharged: 0,
                        joinMailingList,
                        title: klass.title,
                        creations: klass.creations,
                    }))
                )
            )
            navigate('/programs/confirmation?free=true')
        } catch {
            setError(true)
            setSubmitting(false)
        }
    }

    return (
        <Root>
            <Checkbox onChange={(e) => setJoinMailingList(e.target.checked)} checked={joinMailingList}>
                Keep me informed about the latest Fizz Kidz programs and offers.
            </Checkbox>
            <TermsCheckbox
                ref={termsRef}
                showCancellationPolicy={appointmentTypeId !== AcuityConstants.AppointmentTypes.KINGSVILLE_OPENING}
            />
            <Button
                className={classes.primaryButton}
                block
                type={submitting ? 'default' : 'primary'}
                size="large"
                onClick={handleSubmit}
                ref={submitButtonRef}
                style={{ marginBottom: 12, marginTop: 16 }}
            >
                {submitting && <Loader size="sm" />}
                {!submitting && <strong>Confirm and register</strong>}
            </Button>
        </Root>
    )
}

export default FreeConfirmationButton
