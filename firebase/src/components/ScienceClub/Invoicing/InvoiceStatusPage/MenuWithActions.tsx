import React, { useContext, useState } from 'react'
import { Acuity } from 'fizz-kidz'
import { IconButton, Menu, MenuItem } from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../Dialogs/ConfirmationDialog'
import { callAcuityClientV2, callFirebaseFunction } from '../../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../../Firebase'
import { ErrorDialogProps } from '../../../Dialogs/ErrorDialog'

interface MenuWithActionsProps extends ConfirmationDialogProps, ErrorDialogProps {
    appointment: Acuity.Appointment,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    setEmailSent: React.Dispatch<React.SetStateAction<boolean>>
    setIsDeleted: React.Dispatch<React.SetStateAction<boolean>>
}

const MenuWithActions: React.FC<MenuWithActionsProps> = (props) => {

    const {
        appointment,
        setLoading,
        setEmailSent,
        setIsDeleted,
        showConfirmationDialog,
        displayError
    } = props

    const firebase = useContext(FirebaseContext) as Firebase

    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)

    const handleMenuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchorEl(event.currentTarget)
    }

    const sendTermContinuationEmail = async () => {

        setLoading(true)

        try {
            let appointments = await callAcuityClientV2('updateEnrolment', firebase)({
                appointmentTypeId: appointment.appointmentTypeID,
                email: appointment.email,
                childName: Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_NAME),
                fieldId: Acuity.Constants.FormFields.CONTINUING_WITH_TERM_EMAIL_SENT,
                value: 'yes'
            })
            await callFirebaseFunction('sendTermContinuationEmail', firebase)({ ...appointments.data[0] })
            setEmailSent(true)
            setLoading(false)
        } catch (error) {
            console.error('error sending term continuation email')
            setLoading(false)
            displayError("There was an error sending the email. Make sure all fields are correctly supplied in the appointment within Acuity.")
        }
    }

    const unenrollChildFromTerm = async () => {

        setLoading(true)

        try {
            await callAcuityClientV2('unenrollChildFromTerm', firebase)({ appointmentId: appointment.id })
            setIsDeleted(true)
            setLoading(false)
        } catch (error) {
            console.error(`error canceling all appointments for child with id ${appointment.id}`)
            setLoading(false)
            displayError('There was an error unenrolling this child from the term.')
        }
    }

    return (
        <>
            <IconButton onClick={handleMenuButtonClick}>
                {<MoreVertIcon />}
            </IconButton>

            <Menu
                id="menu"
                anchorEl={menuAnchorEl}
                keepMounted
                open={Boolean(menuAnchorEl)}
                onClose={() => setMenuAnchorEl(null)}
            >
                <MenuItem
                    onClick={() => {
                        setMenuAnchorEl(null)
                        showConfirmationDialog({
                            dialogTitle: `Send enrolment email to ${appointment.firstName}`,
                            dialogContent: `This will send an email asking ${appointment.firstName} if they would like to continue with the term or not.`,
                            confirmationButtonText: "Send Email",
                            onConfirm: sendTermContinuationEmail
                        })
                    }}
                >
                    Send Enrolment Email
                    </MenuItem>
                <MenuItem
                    onClick={() => {
                        setMenuAnchorEl(null)
                        showConfirmationDialog({
                            dialogTitle: `Unenroll ${appointment.firstName} from the term`,
                            dialogContent: `This will completely unenroll ${appointment.firstName} from the term, and delete all of their information. This cannot be undone.`,
                            confirmationButtonText: 'Unenroll from term',
                            onConfirm: unenrollChildFromTerm
                        })
                    }}    
                >
                    Unenroll from term
                </MenuItem>
            </Menu>
        </>
    )
}

export default WithConfirmationDialog(MenuWithActions)