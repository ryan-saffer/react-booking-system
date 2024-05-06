import { useState } from 'react'

import { Button } from '@ui-components/button'
import { Checkbox } from '@ui-components/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@ui-components/dialog'

export function UnenrolDialog({
    open,
    dismiss,
    onConfirm,
}: {
    open: boolean
    dismiss: () => void
    onConfirm: (sendConfirmationEmail: boolean) => void
}) {
    const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true)

    const close = () => {
        // reset the checkbox to true whenever closing dialog.
        setSendConfirmationEmail(true)
        dismiss()
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="twp max-w-md">
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This will completely unenroll the selected children from the term. This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="sendEmail"
                        checked={sendConfirmationEmail}
                        onClick={() => setSendConfirmationEmail((prev) => !prev)}
                    />
                    <label
                        htmlFor="sendEmail"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Send unenrolment confirmation email.
                    </label>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={close}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm(sendConfirmationEmail)
                            close()
                        }}
                    >
                        Unenrol
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
