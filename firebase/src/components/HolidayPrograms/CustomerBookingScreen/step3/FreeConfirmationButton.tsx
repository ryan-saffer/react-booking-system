import { makeStyles } from '@material-ui/core'
import { Button } from 'antd'
import { Acuity } from 'fizz-kidz'
import React, { Dispatch, SetStateAction, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Form } from '..'
import { callFirebaseFunction } from '../../../../utilities/firebase/functions'
import useFirebase from '../../../Hooks/context/UseFirebase'
import Loader from '../../../ScienceClub/shared/Loader'
import TermsCheckbox, { TermsCheckboxHandle } from './TermsCheckbox'

type Props = {
    form: Form
    selectedClasses: Acuity.Class[]
    discountCode: string
    setError: Dispatch<SetStateAction<boolean>>
}

const FreeConfirmationButton: React.FC<Props> = ({ form, selectedClasses, discountCode, setError }) => {
    const firebase = useFirebase()
    const classes = useStyles()

    const history = useHistory()

    const termsRef = useRef<TermsCheckboxHandle>(null)
    const submitButtonRef = useRef<HTMLButtonElement>(null)

    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        setTimeout(() => submitButtonRef.current?.blur())
        if (!termsRef.current?.isChecked()) {
            termsRef.current?.showWarning()
            return
        }

        setSubmitting(true)
        try {
            await callFirebaseFunction(
                'scheduleFreeHolidayPrograms',
                firebase
            )(
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
                        childAge: child.childAge,
                        childAllergies: child.allergies ?? '',
                        discountCode: discountCode,
                        amountCharged: 0,
                    }))
                )
            )
            history.push('/holiday-programs/confirmation?free=true')
        } catch (err) {
            setError(true)
            setSubmitting(false)
        }
    }

    return (
        <>
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
        </>
    )
}

const useStyles = makeStyles({
    primaryButton: {
        background: 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)',
        borderColor: 'white',
    },
})

export default FreeConfirmationButton
