import { useConfirm } from '@components/Hooks/confirmation-dialog.tsx/use-confirmation-dialog'
import { Button } from '@ui-components/button'
import { trpc } from '@utils/trpc'

export const Navbar = (props: { showResetButton?: false } | { showResetButton: true; invitationId: string }) => {
    const confirm = useConfirm()

    const { mutateAsync: resetInvitation } = trpc.parties.resetInvitation.useMutation()

    async function onResetClicked(invitationId: string) {
        const confirmed = await confirm({
            title: 'Reset Booking',
            description:
                "This will delete the invitation from the booking, and allow a new one to be created. The RSVP's will remain. It is only shown for testing purposes. You must be logged in for this to work.",
        })

        if (confirmed) {
            await resetInvitation({ invitationId })
        }
    }

    return (
        <div className="relative z-[999] flex h-16 w-full justify-center border-b border-gray-200 bg-white">
            <img src="/fizz-logo.png" className="m-1 w-32"></img>
            {import.meta.env.VITE_ENV === 'dev' && props.showResetButton && (
                <div className="absolute bottom-0 right-8 top-0 m-auto flex items-center justify-center gap-4">
                    Testing Only:
                    <Button variant="outline" onClick={() => onResetClicked(props.invitationId)}>
                        Reset Booking
                    </Button>
                </div>
            )}
        </div>
    )
}
