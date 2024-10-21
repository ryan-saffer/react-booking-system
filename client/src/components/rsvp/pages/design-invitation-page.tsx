import { InvitationsV2, WithoutUid } from 'fizz-kidz'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Img } from 'react-image'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@components/Hooks/context/useAuth'
import { Button } from '@ui-components/button'
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@ui-components/carousel'
import { trpc } from '@utils/trpc'

import { INVITATIONS } from '../constants/invitations'
import { CreateInvitationForm } from '../create-invitation-form'
import { useInvitationRouterState } from '../hooks/use-invitation-router-state'
import { LoginDialog } from '../login-dialog'
import { Navbar } from '../navbar'
import { TRPCClientError } from '@trpc/client'
import { useInvitationImage } from '../hooks/use-invitation-image'
import Loader from '@components/Shared/Loader'

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
        <div className="twp h-full w-full">
            <Navbar />
            {childName && (
                <h1 className="mt-4 text-center font-lilita text-3xl text-[#9B3EEA]">{childName}'s Birthday party</h1>
            )}
            <div className="relative m-auto max-w-3xl">
                <Button variant="outline" className="absolute left-4 top-2" size="sm" onClick={goBack}>
                    <ArrowLeft />
                </Button>
                <p className=" mt-6 text-center font-lilita text-5xl">Step {step}</p>
            </div>
            {step === 1 && <Step1 api={api} setApi={setApi} nextStep={nextStep} />}
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
            <LoginDialog open={!auth && finishPressed} />
        </div>
    )
}

function Step1({
    api,
    setApi,
    nextStep,
}: {
    api: CarouselApi
    setApi: (api: CarouselApi) => void
    nextStep: () => void
}) {
    return (
        <>
            <p className="mt-4 text-center">
                We make kids parties easy!
                <br />
                Choose the design of your invite
            </p>
            <div className="my-4 flex items-center justify-center">
                <p className="italic">Swipe to see more</p>
                <ArrowRight className="ml-2 h-4 w-4" />
            </div>
            <Carousel setApi={setApi} opts={{ align: 'center' }}>
                <CarouselContent className="m-auto max-w-xl">
                    {INVITATIONS.map((invitation, index) => (
                        <CarouselItem key={index} className="basis-full pr-4">
                            <div className="flex flex-col gap-4 rounded-xl border p-2">
                                <p className="text-center text-xl font-semibold">{invitation.name}</p>
                                <img src={invitation.src} className="w-full"></img>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            <div className="my-4 flex items-center justify-center gap-4 pb-20">
                <Button
                    disabled={!api?.canScrollPrev()}
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => api?.scrollPrev()}
                >
                    <ChevronLeft />
                </Button>
                <Button
                    disabled={!api?.canScrollNext()}
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => api?.scrollNext()}
                >
                    <ChevronRight />
                </Button>
            </div>
            {/* </div> */}
            <button
                onClick={nextStep}
                className="fixed bottom-0 flex h-16 w-full  items-center justify-center bg-[#9B3EEA] font-bold text-white"
            >
                Next
            </button>
        </>
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
            const invitation =
                values.$type === 'studio'
                    ? ({
                          childName: values.childName,
                          childAge: values.childAge,
                          time: values.time,
                          date: values.date,
                          $type: 'studio',
                          studio: values.studio,
                          parentName: values.parentName,
                          rsvpDate: values.rsvpDate,
                          parentMobile: values.parentMobile,
                          invitation: INVITATIONS[selectedInvitation].name,
                          bookingId,
                      } as const)
                    : ({
                          childName: values.childName,
                          childAge: values.childAge,
                          time: values.time,
                          date: values.date,
                          $type: 'mobile',
                          address: values.address,
                          parentName: values.parentName,
                          rsvpDate: values.rsvpDate,
                          parentMobile: values.parentMobile,
                          invitation: INVITATIONS[selectedInvitation].name,
                          bookingId,
                      } as const)

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
        <div className="relative p-4">
            <p className="my-8 text-center">Put in your details to customise your invitation.</p>
            <CreateInvitationForm
                defaultValues={defaultValues}
                isLoading={isLoading}
                onSubmit={onSubmit}
                submitButton={
                    <button
                        type="submit"
                        className="fixed bottom-0 -ml-4 flex h-16 w-full items-center justify-center bg-[#9B3EEA] font-bold text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Next'}
                    </button>
                }
                className="pb-16"
            />
        </div>
    )
}

function Step3({ invitationId, nextStep, loading }: { invitationId: string; nextStep: () => void; loading: boolean }) {
    const invitationUrl = useInvitationImage(invitationId)

    return (
        <>
            <div className="px-8">
                <p className="my-4 text-center">You're invitation is ready!</p>
                <p className="my-4 text-center">Use the back arrow to edit the details or choose a different design.</p>
                <div className="relative flex items-center justify-center">
                    <Img
                        src={invitationUrl}
                        loader={<Loader className="my-12" />}
                        className="h-full border"
                        onContextMenu={() => false}
                    />
                    {/* Covers the image so it can't be right clicked and downloaded */}
                    <div className="absolute h-full w-full" />
                </div>
                <div className="pb-24" />
            </div>
            <button
                onClick={nextStep}
                className="fixed bottom-0 flex h-16 w-full items-center justify-center bg-[#9B3EEA] text-center font-semibold text-white"
            >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'FINISH AND SHARE'}
            </button>
        </>
    )
}
