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
}

const MenuWithActions: React.FC<MenuWithActionsProps> = ({ appointment, setLoading, setEmailSent, showConfirmationDialog, displayError }) => {

    const firebase = useContext(FirebaseContext) as Firebase

    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)

    const handleMenuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchorEl(event.currentTarget)
    }

    const sendTermContinuationEmail = async () => {

        setMenuAnchorEl(null)
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
                <MenuItem>Unenrol from term</MenuItem>
            </Menu>
        </>
    )
}

export default WithConfirmationDialog(MenuWithActions)