import { getCloudFunctionsDomain } from 'fizz-kidz'
import { Copy, Download, Mail, MessageCircleMore, PartyPopper, Sparkles } from 'lucide-react'
import { WhatsappShareButton } from 'react-share'
import { toast } from 'sonner'

import { WhatsappIcon } from '@drawables/icons/whatsapp'
import { Button } from '@ui-components/button'
import { Dialog, DialogContent } from '@ui-components/dialog'
import { Input } from '@ui-components/input'
import { Label } from '@ui-components/label'

import { useInvitation } from '../hooks/use-invitation'
import { useInvitationImage } from '../hooks/use-invitation-image'

export function ShareInvitaitonDialog({ isOpen, close }: { isOpen: boolean; close: () => void }) {
    const invitation = useInvitation()
    const invitationText = `You're invited to ${invitation.childName}'s party!`
    const inviteUrl = `${getCloudFunctionsDomain(import.meta.env.VITE_ENV, import.meta.env.DEV)}/webhooks/invitation/${invitation.bookingId}`
    const invitationImageUrl = useInvitationImage(invitation.id, false)

    function copy() {
        navigator.clipboard.writeText(inviteUrl)
        toast.success('Invitation copied to clipboard!')
    }

    async function downloadInvitation() {
        if (!invitationImageUrl) return
        const result = await fetch(invitationImageUrl)
        const blob = await result.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${invitation.childName}'s Party Invitation.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
    }

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="twp max-w-3xl overflow-hidden border-none bg-gradient-to-br from-[#F7F1FF] via-white to-[#EAF6FF] p-0">
                <div className="space-y-6 p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-[#9B3EEA]">
                                <PartyPopper className="h-4 w-4" />
                                Ready to send
                            </div>
                            <h5 className="font-lilita text-3xl text-slate-900 sm:text-4xl">Share your invitation</h5>
                            <p className="text-sm text-slate-600">
                                Share the link or download and print the invite (QR code included) so guests can RSVP
                                instantly.
                            </p>
                        </div>
                        <div className="hidden items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#9B3EEA] shadow sm:inline-flex">
                            <Sparkles className="h-4 w-4" />
                            Link never expires
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/70 bg-white/80 p-3 shadow-md backdrop-blur">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                            <Input value={inviteUrl} readOnly className="text-sm" />
                            <Button variant="outline" className="w-full sm:w-auto" onClick={copy}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy link
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full sm:w-auto"
                                onClick={downloadInvitation}
                                disabled={!invitationImageUrl}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download invite
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <ShareTile>
                            <WhatsappShareButton id="whatsapp" url={inviteUrl}>
                                <WhatsappIcon aria-hidden="true" size={32} />
                            </WhatsappShareButton>
                            <Label
                                htmlFor="whatsapp"
                                className="mt-2 cursor-pointer text-sm font-semibold text-slate-800"
                            >
                                WhatsApp
                            </Label>
                        </ShareTile>
                        <ShareTile onClick={() => window.open(`sms://?body=${encodeURIComponent(inviteUrl)}`)}>
                            <MessageCircleMore id="sms" className="h-8 w-8 text-slate-800" />
                            <Label htmlFor="sms" className="mt-2 cursor-pointer text-sm font-semibold text-slate-800">
                                SMS
                            </Label>
                        </ShareTile>
                        <ShareTile
                            onClick={() =>
                                window.open(
                                    `mailto: ?subject=${encodeURIComponent(invitationText)}&body=${encodeURIComponent(inviteUrl)}`
                                )
                            }
                        >
                            <Mail id="email" className="h-8 w-8 text-slate-800" />
                            <Label htmlFor="email" className="mt-2 cursor-pointer text-sm font-semibold text-slate-800">
                                Email
                            </Label>
                        </ShareTile>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Want to see what your guests will experience? Try opening the link in an{' '}
                        <span className="italic">incognito</span> or <span className="italic">private</span> window.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ShareTile({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group flex h-full w-full flex-col items-center justify-center rounded-xl border border-white/70 bg-white/80 p-3 text-slate-700 shadow-sm transition hover:border-[#9B3EEA]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B3EEA] focus-visible:ring-offset-2"
        >
            <span className="flex flex-col items-center justify-center gap-1 group-hover:text-[#9B3EEA]">
                {children}
            </span>
        </button>
    )
}
