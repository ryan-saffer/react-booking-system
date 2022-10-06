import React, { useContext, useState } from 'react'
import { PriceWeekMap, ScienceEnrolment } from 'fizz-kidz'
import { IconButton, Menu, MenuItem } from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../../Dialogs/ConfirmationDialog'
import { callFirebaseFunction } from '../../../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../../../Firebase'
import { ErrorDialogProps } from '../../../../Dialogs/ErrorDialog'

interface MenuWithActionsProps extends ConfirmationDialogProps, ErrorDialogProps {
    appointment: ScienceEnrolment
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    setEmailSent: React.Dispatch<React.SetStateAction<boolean>>
    setIsDeleted: React.Dispatch<React.SetStateAction<boolean>>
    forceRerenderExpandableRow: () => void
}

const MenuWithActions: React.FC<MenuWithActionsProps> = (props) => {
    const {
        appointment,
        setLoading,
        setEmailSent,
        setIsDeleted,
        showConfirmationDialog,
        displayError,
        forceRerenderExpandableRow,
    } = props

    const firebase = useContext(FirebaseContext) as Firebase

    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)

    const handleMenuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchorEl(event.currentTarget)
    }

    const sendTermContinuationEmail = async () => {
        setLoading(true)

        try {
            await callFirebaseFunction(
                'sendTermContinuationEmailV2',
                firebase
            )({
                appointmentId: appointment.id,
            })
            setEmailSent(true)
            setLoading(false)
        } catch (error) {
            console.error('error sending term continuation email')
            setLoading(false)
            displayError('There was an error sending the email.')
        }
    }

    const unenrollChildFromTerm = async () => {
        setLoading(true)

        try {
            await callFirebaseFunction('unenrollScienceAppointment', firebase)({ appointmentId: appointment.id })
            setIsDeleted(true)
            setLoading(false)
        } catch (error) {
            console.error(`error canceling all appointments for child with id ${appointment.id}`)
            setLoading(false)
            displayError('There was an error unenrolling this child from the term.')
        }
    }

    const voidAndResendInvoice = async (price: string) => {
        setLoading(true)

        try {
            await callFirebaseFunction(
                'voidAndResendInvoiceV2',
                firebase
            )({
                id: appointment.id,
                price,
            })
            setLoading(false)
            forceRerenderExpandableRow()
        } catch (error) {
            console.error('error resending invoice')
            setLoading(false)
            displayError('There was an error resending the invoice')
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
                onClose={() => setMenuAnchorEl(null)}
            >
                <MenuItem
                    onClick={() => {
                        setMenuAnchorEl(null)
                        showConfirmationDialog({
                            dialogTitle: `Send enrolment email to ${appointment.parent.firstName}`,
                            dialogContent: `This will send an email asking ${appointment.parent.firstName} if they would like to continue with the term or not.`,
                            confirmationButtonText: 'Send Email',
                            onConfirm: sendTermContinuationEmail,
                        })
                    }}
                >
                    Send Enrolment Email
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setMenuAnchorEl(null)
                        showConfirmationDialog({
                            dialogTitle: `Unenroll ${appointment.child.firstName} from the term`,
                            dialogContent: `This will completely unenroll ${appointment.child.firstName} from the term, and delete all of their information. This cannot be undone.`,
                            confirmationButtonText: 'Unenroll from term',
                            onConfirm: unenrollChildFromTerm,
                        })
                    }}
                >
                    Unenroll from term
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setMenuAnchorEl(null)
                        showConfirmationDialog({
                            dialogTitle: 'Send Invoice',
                            dialogContent: `This will void the existing invoice and issue a new one.Select the amount you'd like to invoice ${appointment.parent.firstName}.`,
                            confirmationButtonText: 'Send Invoice',
                            listItems: {
                                title: 'Invoice Price',
                                items: Object.entries(PriceWeekMap).map(([key, value]) => ({
                                    key,
                                    value: `$${key} (${value} weeks)`,
                                })),
                            },
                            onConfirm: (selectedPrice) => voidAndResendInvoice(selectedPrice),
                        })
                    }}
                >
                    Resend Invoice
                </MenuItem>
            </Menu>
        </>
    )
}

export default WithConfirmationDialog(MenuWithActions)
