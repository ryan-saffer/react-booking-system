import { Dialog, DialogContent } from '@ui-components/dialog'
import { InvitationsV2 } from 'fizz-kidz'
import { Img } from 'react-image'
import { useInvitationImage } from '../hooks/use-invitation-image'
import Loader from '@components/Shared/Loader'
import { Button } from '@ui-components/button'
import { useState } from 'react'
import { CreateInvitationForm } from '../create-invitation-form'
import { trpc } from '@utils/trpc'
import { Download, Edit, Loader2 } from 'lucide-react'

export function EditInvitationDialog({
    invitation,
    isOpen,
    close,
}: {
    invitation: InvitationsV2.Invitation
    isOpen: boolean
    close: () => void
}) {
    const invitationUrl = useInvitationImage(invitation.id)

    const [isEditing, setIsEditing] = useState(false)

    const { isLoading, mutateAsync: editInvitation } = trpc.parties.editInvitation.useMutation()

    async function onSubmit(values: InvitationsV2.Invitation) {
        await editInvitation({
            ...values,
            bookingId: invitation.bookingId,
            id: invitation.id,
            uid: invitation.uid,
            invitation: invitation.invitation,
        })
        setIsEditing(false)
        close()
        location.reload() // needed to refetch the image from storage
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={() => {
                setIsEditing(false)
                close()
            }}
        >
            <DialogContent className="twp">
                {!isEditing ? (
                    <div className="flex flex-col">
                        <h5 className="my-4 text-center font-lilita text-2xl">Invitation Preview</h5>
                        <Img src={invitationUrl} loader={<Loader className="my-12" />} />
                        <div className="mt-4 flex w-full gap-2">
                            <a href={invitationUrl} download="invitation.png" className="w-1/2">
                                <Button className="w-full bg-[#FFDC5D] text-black hover:bg-[#FFDC5D]/80">
                                    Download Invitation
                                    <Download className="ml-2 h-4 w-4" />
                                </Button>
                            </a>
                            <Button
                                className="w-1/2 bg-[#9B3EEA] hover:bg-[#9B3EEA]/80"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Invitation
                                <Edit className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h5 className="mt-4 text-center font-lilita text-2xl">Edit Invitation</h5>
                        <p className="my-3">
                            If you'd like to choose a different invitation design, open the link in your booking
                            confirmation email and start again.
                            <br />
                            <br />
                            You will not lose any of your RSVP's, and will be taken back to this page once the
                            invitation has been generated.
                        </p>
                        <CreateInvitationForm
                            defaultValues={invitation}
                            isLoading={isLoading}
                            onSubmit={onSubmit}
                            submitButton={
                                <Button
                                    type="submit"
                                    className="w-full bg-[#9B3EEA] hover:bg-[#9B3EEA]/80"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Invitation'}
                                </Button>
                            }
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
