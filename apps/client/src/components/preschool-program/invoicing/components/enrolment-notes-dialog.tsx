import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@ui-components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@ui-components/dialog'
import { Textarea } from '@ui-components/textarea'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    loading: boolean
    enrolment?: {
        childName: string
        parentName: string
        notes: string
    }
    onSave: (notes: string) => Promise<void>
}

export function EnrolmentNotesDialog({ open, onOpenChange, loading, enrolment, onSave }: Props) {
    const [notes, setNotes] = useState(enrolment?.notes ?? '')

    async function handleSave() {
        await onSave(notes.trim())
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="twp">
                <DialogHeader>
                    <DialogTitle>Enrolment Notes</DialogTitle>
                    <DialogDescription>
                        {enrolment
                            ? `Add internal notes for ${enrolment.childName} (${enrolment.parentName}).`
                            : 'Add internal notes for this enrolment.'}
                    </DialogDescription>
                </DialogHeader>

                <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    disabled={loading}
                    placeholder="Example: Parent asked to delay invoice until sibling enrolment is confirmed."
                    className="min-h-40"
                />

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={() => void handleSave()} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Notes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
