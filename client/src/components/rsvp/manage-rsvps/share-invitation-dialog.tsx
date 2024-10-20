import { getApplicationDomain } from 'fizz-kidz'
import { Copy, Mail, MessageCircleMore } from 'lucide-react'
import { WhatsappShareButton } from 'react-share'
import { toast } from 'sonner'

import { WhatsappIcon } from '@drawables/icons/whatsapp'
import { Button } from '@ui-components/button'
import { Dialog, DialogContent } from '@ui-components/dialog'
import { Input } from '@ui-components/input'
import { Label } from '@ui-components/label'
import { Separator } from '@ui-components/separator'

import { useInvitation } from '../hooks/use-invitation'

export function ShareInvitaitonDialog({ isOpen, close }: { isOpen: boolean; close: () => void }) {
    const invitation = useInvitation()
    const invitationText = `You're invited to ${invitation.childName}'s party!`
    const inviteUrl = `${getApplicationDomain(import.meta.env.VITE_ENV)}/invitation/v2/${invitation.id}`

    function copy() {
        navigator.clipboard.writeText(inviteUrl)
        toast.success('Invitation copied to clipboard!')
    }

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="twp">
                <div className="flex flex-col p-4">
                    <h5 className="font-lilita text-2xl">Let the party begin!</h5>
                    <p className="mt-2 font-gotham tracking-tight">
                        Share your invitation with all of {invitation.childName}'s friends.
                        <br />
                        <br />
                        With this link, anyone will be able to see your invitation and RSVP - helping you track who can
                        and cannot attend!
                    </p>
                    <Separator className="my-6" />
                    <div className="flex gap-2">
                        <Input value={inviteUrl} readOnly />
                        <Button variant="outline" onClick={copy}>
                            <Copy className="h-6 w-6" />
                        </Button>
                    </div>
                    <Separator className="my-6" />
                    <div className="grid grid-cols-2 items-center justify-center p-4 min-[350px]:grid-cols-4">
                        <Button
                            variant="ghost"
                            className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg p-2 hover:bg-slate-100"
                        >
                            <WhatsappShareButton aria-hidden="true" tabIndex={-1} id="whatsapp" url={inviteUrl}>
                                <WhatsappIcon aria-hidden="true" size={36} />
                            </WhatsappShareButton>
                            <Label htmlFor="whatsapp" className="mt-2 cursor-pointer">
                                Whatsapp
                            </Label>
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg p-2 hover:bg-slate-100"
                            onClick={() => window.open(`sms://?body=${encodeURIComponent(inviteUrl)}`)}
                        >
                            <MessageCircleMore id="sms" className="h-9 w-9" />
                            <Label htmlFor="sms" className="mt-2 cursor-pointer">
                                SMS
                            </Label>
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg p-2 hover:bg-slate-100"
                            onClick={() =>
                                window.open(
                                    `mailto: ?subject=${encodeURIComponent(invitationText)}&body=${encodeURIComponent(inviteUrl)}`
                                )
                            }
                        >
                            <Mail id="email" className="h-9 w-9" />
                            <Label htmlFor="email" className="mt-2 cursor-pointer">
                                Email
                            </Label>
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg p-2 hover:bg-slate-100"
                            onClick={copy}
                        >
                            <Copy id="copy" className="h-9 w-9" />
                            <Label htmlFor="copy" className="mt-2 cursor-pointer">
                                Copy
                            </Label>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
