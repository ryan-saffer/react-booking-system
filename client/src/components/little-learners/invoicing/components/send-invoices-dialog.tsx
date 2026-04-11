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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    loading: boolean
    onConfirm: (numberOfWeeks: number) => Promise<void>
}

export function SendInvoicesDialog({ open, onOpenChange, loading, onConfirm }: Props) {
    const [numberOfWeeks, setNumberOfWeeks] = useState('1')

    async function handleConfirm() {
        await onConfirm(parseInt(numberOfWeeks))
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="twp">
                <DialogHeader>
                    <DialogTitle>Send Invoices</DialogTitle>
                    <DialogDescription>
                        Choose how many weeks to invoice for the selected Little Learners enrolments.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <p className="text-sm font-medium">Number of weeks</p>
                    <Select value={numberOfWeeks} onValueChange={setNumberOfWeeks} disabled={loading}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 10 }, (_, idx) => idx + 1).map((weeks) => (
                                <SelectItem key={weeks} value={String(weeks)}>
                                    {weeks} {weeks === 1 ? 'week' : 'weeks'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={() => void handleConfirm()} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send Invoices
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
