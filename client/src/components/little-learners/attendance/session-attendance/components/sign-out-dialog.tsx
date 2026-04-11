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
import { Input } from '@ui-components/input'
import { Label } from '@ui-components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Textarea } from '@ui-components/textarea'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    parentName: string
    emergencyContactName: string
    onConfirm: (args: { pickupPerson: string; staffReason: string }) => Promise<void>
    loading: boolean
}

type PickupOption = 'parent' | 'emergency-contact' | 'staff' | 'other'

export function SignOutDialog({ open, onOpenChange, parentName, emergencyContactName, onConfirm, loading }: Props) {
    if (!open) {
        return <Dialog open={open} onOpenChange={onOpenChange} />
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <SignOutDialogContent
                key={`${parentName}-${emergencyContactName}-${String(open)}`}
                parentName={parentName}
                emergencyContactName={emergencyContactName}
                onOpenChange={onOpenChange}
                onConfirm={onConfirm}
                loading={loading}
            />
        </Dialog>
    )
}

function SignOutDialogContent({
    parentName,
    emergencyContactName,
    onOpenChange,
    onConfirm,
    loading,
}: Omit<Props, 'open'>) {
    const defaultOption: PickupOption = parentName ? 'parent' : emergencyContactName ? 'emergency-contact' : 'staff'

    const [pickupOption, setPickupOption] = useState<PickupOption>(defaultOption)
    const [customPickupPerson, setCustomPickupPerson] = useState('')
    const [staffReason, setStaffReason] = useState('')
    const [error, setError] = useState('')

    async function handleConfirm() {
        const pickupPerson =
            pickupOption === 'parent'
                ? parentName
                : pickupOption === 'emergency-contact'
                  ? emergencyContactName
                  : pickupOption === 'staff'
                    ? 'Fizz Kidz Staff'
                    : customPickupPerson.trim()

        if (!pickupPerson) {
            setError('Please choose who picked up the child.')
            return
        }

        if (pickupOption === 'staff' && !staffReason.trim()) {
            setError('Please add a reason when signing out with staff.')
            return
        }

        setError('')
        await onConfirm({ pickupPerson, staffReason: staffReason.trim() })
    }

    function stopPropagation(event: { stopPropagation: () => void }) {
        event.stopPropagation()
    }

    return (
        <DialogContent className="twp" onClick={stopPropagation} onPointerDown={stopPropagation}>
            <DialogHeader>
                <DialogTitle>Sign Out Child</DialogTitle>
                <DialogDescription>Record who collected the child before finishing sign out.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Collected by</Label>
                    <Select value={pickupOption} onValueChange={(value) => setPickupOption(value as PickupOption)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {parentName ? <SelectItem value="parent">{parentName}</SelectItem> : null}
                            {emergencyContactName ? (
                                <SelectItem value="emergency-contact">{emergencyContactName}</SelectItem>
                            ) : null}
                            <SelectItem value="staff">Fizz Kidz Staff</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {pickupOption === 'other' ? (
                    <div className="space-y-2">
                        <Label htmlFor="pickup-person">Pickup person</Label>
                        <Input
                            id="pickup-person"
                            value={customPickupPerson}
                            onChange={(event) => setCustomPickupPerson(event.target.value)}
                            placeholder="Enter the pickup person's name"
                        />
                    </div>
                ) : null}

                {pickupOption === 'staff' ? (
                    <div className="space-y-2">
                        <Label htmlFor="staff-reason">Reason</Label>
                        <Textarea
                            id="staff-reason"
                            value={staffReason}
                            onChange={(event) => setStaffReason(event.target.value)}
                            placeholder="Why was the child signed out with staff?"
                        />
                    </div>
                ) : null}

                {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                    Cancel
                </Button>
                <Button type="button" onClick={() => void handleConfirm()} disabled={loading}>
                    Confirm Sign Out
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}
