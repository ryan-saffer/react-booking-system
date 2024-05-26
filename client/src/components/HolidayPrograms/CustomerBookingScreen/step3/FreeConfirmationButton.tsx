import { Button } from 'antd'
import type { AcuityTypes } from 'fizz-kidz'
import React, { Dispatch, SetStateAction, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Loader from '@components/Shared/Loader'
import { styled } from '@mui/material/styles'
import { trpc } from '@utils/trpc'

import { TermsCheckbox, TermsCheckboxHandle } from './TermsCheckbox'
import { Form } from '..'

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
    form: Form
    selectedClasses: AcuityTypes.Api.Class[]
    discountCode: string
    setError: Dispatch<SetStateAction<boolean>>
}

const FreeConfirmationButton: React.FC<Props> = ({ form, selectedClasses, discountCode, setError }) => {
    const navigate = useNavigate()

    const termsRef = useRef<TermsCheckboxHandle>(null)
    const submitButtonRef = useRef<HTMLButtonElement>(null)

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
                    }))
                )
            )
            navigate('/holiday-programs/confirmation?free=true')
        } catch {
            setError(true)
            setSubmitting(false)
        }
    }

    return (
        <Root>
            <TermsCheckbox ref={termsRef} />
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
