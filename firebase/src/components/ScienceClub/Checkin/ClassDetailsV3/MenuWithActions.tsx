import React, { useContext, useState } from 'react'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../Dialogs/ConfirmationDialog'
import WithErrorDialog, { ErrorDialogProps } from '../../../Dialogs/ErrorDialog'
import { Acuity, ScienceEnrolment } from 'fizz-kidz'
import { callAcuityClientV2 } from '../../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../../Firebase'
import { compose } from 'recompose'
import { IconButton, Menu, MenuItem } from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert'

interface MenuWithActionProps extends ConfirmationDialogProps, ErrorDialogProps {
    appointment: Acuity.Appointment
    firestoreDocument: ScienceEnrolment
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    setNotAttending: React.Dispatch<React.SetStateAction<boolean>>
}

const MenuWithAction: React.FC<MenuWithActionProps> = (props) => {
    const { appointment, setLoading, showConfirmationDialog, displayError, setNotAttending } = props

    const firebase = useContext(FirebaseContext) as Firebase

    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)

    const handleMenuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        event.preventDefault()
        setMenuAnchorEl(event.currentTarget)
    }

    const childName = Acuity.Utilities.retrieveFormAndField(
        appointment,
        Acuity.Constants.Forms.CHILD_DETAILS,
        Acuity.Constants.FormFields.CHILD_NAME
    )

    const markNotAttending = async (e: any) => {
        setLoading(true)

        try {
            await callAcuityClientV2(
                'updateLabel',
                firebase
            )({
                appointmentId: appointment.id,
                label: Acuity.Constants.Labels.NOT_ATTENDING,
            })
            setLoading(false)
            setNotAttending(true)
        } catch (error) {
            console.error(`error updating label for appointment: ${appointment.id}`)
            setLoading(false)
            displayError('There was an error updating the label')
        }
    }
    return (
        <>
            <IconButton onClick={handleMenuButtonClick}>{<MoreVertIcon />}</IconButton>

            <Menu
                id="menu"
                anchorEl={menuAnchorEl}
                keepMounted
                open={Boolean(menuAnchorEl)}
                onClose={(e: any) => {
                    e.stopPropagation()
                    setMenuAnchorEl(null)
                }}
            >
                <MenuItem
                    onClick={(e) => {
                        e.stopPropagation()
                        setMenuAnchorEl(null)
                        showConfirmationDialog({
                            dialogTitle: `Mark ${childName} as not attending?`,
                            dialogContent: `Select this if ${childName} will not be attending the program today.`,
                            confirmationButtonText: 'Confirm',
                            onConfirm: markNotAttending,
                        })
                    }}
                >
                    Mark not attending
                </MenuItem>
            </Menu>
        </>
    )
}

export default compose<MenuWithActionProps, any>(WithErrorDialog, WithConfirmationDialog)(MenuWithAction)
