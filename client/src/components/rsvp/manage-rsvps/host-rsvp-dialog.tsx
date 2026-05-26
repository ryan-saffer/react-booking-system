import { toast } from 'sonner'

import type { InvitationsV2 } from 'fizz-kidz'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@ui-components/dialog'

import { RsvpForm } from '../rsvp-form'

export function HostRsvpDialog({
    invitation,
    isOpen,
    close,
}: {
    invitation: InvitationsV2.Invitation
    isOpen: boolean
    close: () => void
}) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
            <DialogContent className="twp max-h-[90vh] w-full max-w-[95vw] overflow-auto bg-white sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add an RSVP</DialogTitle>
                    <DialogDescription>
                        Add a response on behalf of a guest. This will not add them to Zoho or send a confirmation
                        email.
                    </DialogDescription>
                </DialogHeader>
                <RsvpForm
                    invitation={invitation}
                    mode="host"
                    onComplete={() => {
                        toast.success('RSVP added')
                        close()
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}
