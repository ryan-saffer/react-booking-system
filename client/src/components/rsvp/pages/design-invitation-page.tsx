import type { InvitationsV2, WithoutId, WithoutUid } from 'fizz-kidz'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Sparkles, Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Img } from 'react-image'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@components/Hooks/context/useAuth'
import Loader from '@components/Shared/Loader'
import { TRPCClientError } from '@trpc/client'
import { Button } from '@ui-components/button'
import type { CarouselApi } from '@ui-components/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@ui-components/carousel'
import { trpc } from '@utils/trpc'

import { INVITATIONS } from '../constants/invitations'
import { CreateInvitationForm } from '../create-invitation-form'
import { useInvitationImage } from '../hooks/use-invitation-image'
import { useInvitationRouterState } from '../hooks/use-invitation-router-state'
import { LoginDialog } from '../login-dialog'
import { Navbar } from '../navbar'

export function DesignInvitationPage() {
    const auth = useAuth()

    const state = useInvitationRouterState()
    const { childName } = state

    const [step, setStep] = useState(1)
    const [invitation, setInvitation] = useState<WithoutUid<InvitationsV2.Invitation> | null>(null)

    const navigate = useNavigate()

    const [api, setApi] = useState<CarouselApi>()
    const [selectedInvitation, setSelectedInvitation] = useState(0)

    const [finishPressed, setFinishPressed] = useState(false)

    const { mutateAsync: linkInvitation } = trpc.parties.linkInvitation.useMutation()

    // track selected carousel item
    useEffect(() => {
        if (!api) {
            return
        }

        setSelectedInvitation(api.selectedScrollSnap())

        api.on('select', () => {
            setSelectedInvitation(api.selectedScrollSnap())
        })
    }, [api])

    // scroll to top when moving between steps
    useEffect(() => {
        window.scrollTo({ top: 0 })
    }, [step])

    const hasCreatedAccount = !!auth && finishPressed

    // listening for when both authenticated and ready to move on
    useEffect(() => {
        async function _linkInvitation() {
            if (hasCreatedAccount && invitation) {
                try {
                    const { invitationId } = await linkInvitation(invitation)
                    navigate(`/invitation/v2/${invitationId}`)
                } catch (err: any) {
                    let message = 'There was an error linking your invitation to your booking.'
                    if (err instanceof TRPCClientError) {
                        message = err.message
                    }
                    toast.error(message, {
                        duration: Infinity,
                        closeButton: true,
                    })
                } finally {
                    setFinishPressed(false)
                }
            }
        }

        _linkInvitation()
    }, [hasCreatedAccount, invitation, linkInvitation, navigate])

    function nextStep() {
        if (step === 3) {
            setFinishPressed(true)
        } else {
            setStep((prev) => prev + 1)
        }
    }

    function goBack() {
        if (step === 1) {
            navigate(-1)
            return
        }

        setStep((prev) => prev - 1)
    }

    return (
        <div className="twp min-h-screen bg-gradient-to-br from-[#F7F1FF] via-white to-[#EAF6FF]">
            <Navbar />
            <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-3">
                    <Button variant="ghost" size="sm" className="gap-2 text-slate-700" onClick={goBack}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div className="text-sm font-semibold text-slate-600">Step {step} of 3</div>
                </div>
                {childName && (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/80 px-6 py-4 shadow-lg backdrop-blur">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-[#F2E7FF] p-2 text-[#9B3EEA]">
                                <Wand2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                    Invitation setup
                                </p>
                                <p className="font-lilita text-2xl text-slate-900">{childName}'s birthday party</p>
                            </div>
                        </div>
                        <div className="hidden text-sm text-slate-600 sm:block">
                            We'll choose a design, personalise details, then preview & share.
                        </div>
                    </div>
                )}
                <div className="mt-6 h-2 rounded-full bg-white/60 shadow-inner">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#9B3EEA] to-[#7EC8F4] transition-all"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
                <div className="mt-8">
                    {step === 1 && (
                        <Step1 api={api} setApi={setApi} nextStep={nextStep} selectedInvitation={selectedInvitation} />
                    )}
                    {step === 2 && (
                        <Step2
                            selectedInvitation={selectedInvitation}
                            onInvitationGenerated={(invitation) => {
                                setInvitation(invitation)
                                nextStep()
                            }}
                        />
                    )}
                    {step === 3 && invitation && (
                        <Step3 invitationId={invitation.id} nextStep={nextStep} loading={hasCreatedAccount} />
                    )}
                </div>
                <LoginDialog open={!auth && finishPressed} />
            </div>
        </div>
    )
}

function Step1({
    api,
    setApi,
    nextStep,
    selectedInvitation,
}: {
    api: CarouselApi | undefined
    setApi: (api: CarouselApi) => void
    nextStep: () => void
    selectedInvitation: number
}) {
    const selectedName = INVITATIONS[selectedInvitation]?.name

    return (
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Step 1</p>
                    <p className="text-xl font-semibold text-slate-900">Choose your invitation design</p>
                    <p className="text-sm text-slate-600">Swipe through the options or use the arrows to preview.</p>
                </div>
                {selectedName && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#F2E7FF] px-3 py-2 text-sm font-semibold text-[#9B3EEA]">
                        <Sparkles className="h-4 w-4" />
                        {selectedName}
                    </div>
                )}
            </div>
            <div className="px-4 py-6 sm:px-6">
                <div className="mb-4 flex items-center justify-center gap-3">
                    <Button
                        disabled={!api?.canScrollPrev()}
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white/80"
                        onClick={() => api?.scrollPrev()}
                    >
                        <ChevronLeft />
                    </Button>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Swipe or tap to preview
                    </p>
                    <Button
                        disabled={!api?.canScrollNext()}
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white/80"
                        onClick={() => api?.scrollNext()}
                    >
                        <ChevronRight />
                    </Button>
                </div>
                <Carousel className="pb-4" setApi={setApi} opts={{ align: 'center' }}>
                    <CarouselContent className="m-auto max-w-3xl">
                        {INVITATIONS.map((invitation, index) => {
                            const isActive = selectedInvitation === index
                            return (
                                <CarouselItem key={index} className="basis-full px-2 sm:px-4">
                                    <div
                                        className={`relative overflow-hidden rounded-2xl border bg-white shadow-lg transition-all duration-200 ${
                                            isActive ? 'scale-[1.01] border-slate-200 shadow-xl' : 'border-slate-100'
                                        }`}
                                    >
                                        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
                                            {invitation.name}
                                        </div>
                                        <img src={invitation.src} className="w-full" />
                                    </div>
                                </CarouselItem>
                            )
                        })}
                    </CarouselContent>
                </Carousel>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-600">
                        We'll personalise this design with your party details next.
                    </p>
                    <Button
                        className="rounded-xl bg-[#9B3EEA] px-6 text-sm font-semibold hover:bg-[#8B2DE3]"
                        onClick={nextStep}
                    >
                        Use this design
                    </Button>
                </div>
            </div>
        </div>
    )
}

function Step2({
    selectedInvitation,
    onInvitationGenerated,
}: {
    selectedInvitation: number
    onInvitationGenerated: (invitation: WithoutUid<InvitationsV2.Invitation>) => void
}) {
    const state = useInvitationRouterState()
    const { bookingId, ...defaultValues } = state

    const { isLoading, mutateAsync: generateInvitation } = trpc.parties.generateInvitationV2.useMutation()

    const onSubmit = async (values: InvitationsV2.Invitation) => {
        try {
            const invitation = {
                childName: values.childName,
                childAge: values.childAge,
                time: values.time,
                date: values.date,
                studio: values.studio,
                parentName: values.parentName,
                rsvpDate: values.rsvpDate,
                parentMobile: values.parentMobile,
                invitation: INVITATIONS[selectedInvitation].name,
                rsvpNotificationsEnabled: values.rsvpNotificationsEnabled,
                bookingId,
                ...(values.$type === 'studio'
                    ? {
                          $type: 'studio',
                      }
                    : {
                          $type: 'mobile',
                          address: values.address,
                      }),
            } satisfies WithoutUid<WithoutId<InvitationsV2.Invitation>>

            const { invitationId } = await generateInvitation(invitation)
            onInvitationGenerated({ ...invitation, id: invitationId })
        } catch (err: any) {
            if (err?.data?.code === 'UNAUTHORIZED') {
                // This page is not technically protected, and clearing cookies can remove their anonymous login.
                // In this case, they must return to the starting screen and sign in anonymously again.
                toast.error(
                    'There was an error generating your invitation. Please return to the link sent to you in your booking confirmation email.'
                )
            } else {
                toast.error('There was an error generating your invitation.')
            }
        }
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-2xl backdrop-blur">
            <div className="border-b border-slate-100 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Step 2</p>
                <p className="text-xl font-semibold text-slate-900">Confirm the party details</p>
                <p className="text-sm text-slate-600">
                    We pre-filled everything from your booking. Update anything that needs tweaking before we generate
                    your invite.
                </p>
            </div>
            <div className="relative px-4 py-6 sm:px-6">
                <CreateInvitationForm
                    defaultValues={defaultValues}
                    isLoading={isLoading}
                    onSubmit={onSubmit}
                    submitButton={
                        <div className="sticky bottom-0 left-0 right-0 -mx-4 -mb-4 bg-gradient-to-t from-white via-white to-white/80 px-4 pb-4 pt-4 sm:px-0">
                            <Button
                                type="submit"
                                className="w-full rounded-xl bg-[#9B3EEA] font-semibold shadow-lg hover:bg-[#8B2DE3]"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Preview invitation'}
                            </Button>
                        </div>
                    }
                    className="pb-20"
                />
            </div>
        </div>
    )
}

function Step3({ invitationId, nextStep, loading }: { invitationId: string; nextStep: () => void; loading: boolean }) {
    const invitationUrl = useInvitationImage(invitationId, true)

    return (
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-2xl backdrop-blur">
            <div className="border-b border-slate-100 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Step 3</p>
                <p className="text-xl font-semibold text-slate-900">Preview your invitation</p>
                <p className="text-sm text-slate-600">
                    Looks good? Save and move to sharing. You can go back to adjust details or pick a different design.
                </p>
            </div>
            <div className="px-4 py-8 sm:px-8">
                <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <Img
                        src={invitationUrl}
                        loader={<Loader className="my-12" />}
                        className="h-full w-full"
                        onContextMenu={() => false}
                    />
                    <div className="absolute inset-0" />
                </div>
                <div className="mt-8 flex items-center justify-center">
                    <Button
                        onClick={nextStep}
                        className="min-w-[220px] rounded-xl bg-[#9B3EEA] px-6 font-semibold shadow-lg hover:bg-[#8B2DE3]"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Finish & share'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
