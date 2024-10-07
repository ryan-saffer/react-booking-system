import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Img } from 'react-image'
import { useNavigate } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { useAuth } from '@components/Hooks/context/useAuth'
import { Button } from '@ui-components/button'
import { Card, CardContent } from '@ui-components/card'
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@ui-components/carousel'

import { INVITATIONS } from '../constants/invitations'
import { CreateInvitationForm } from '../create-invitation-form'
import { useInvitationRouterState } from '../hooks/use-invitation-router-state'
import { LoginDialog } from '../login-dialog'
import { Navbar } from '../navbar'

export function DesignInvitationPage() {
    const auth = useAuth()
    const { childName } = useInvitationRouterState()

    const [step, setStep] = useState(1)
    const [invitationId, setInvitationId] = useState('')

    const navigate = useNavigate()

    const [api, setApi] = useState<CarouselApi>()
    const [selectedInvitation, setSelectedInvitation] = useState(0)

    const [finishPressed, setFinishPressed] = useState(false)

    useEffect(() => {
        if (!api) {
            return
        }

        setSelectedInvitation(api.selectedScrollSnap())

        api.on('select', () => {
            setSelectedInvitation(api.selectedScrollSnap())
        })
    }, [api])

    useEffect(() => {
        window.scrollTo({ top: 0 })
    }, [step])

    useEffect(() => {
        if (!!auth && !auth.isAnonymous && finishPressed) {
            // TODO: link invitation to booking and move to RSVP screen
            console.log('time to link invitation and navigate to RSVP!')
            navigate('/invitations-v2/manage/123')
        }
    }, [finishPressed, auth, navigate])

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
            <div className="relative">
                <Button variant="outline" className="absolute left-8 top-1" onClick={goBack}>
                    <ArrowLeft />
                </Button>
                <p className=" mt-6 text-center font-lilita text-5xl">Step {step}</p>
            </div>
            {step === 1 && <Step1 setApi={setApi} nextStep={nextStep} />}
            {step === 2 && (
                <Step2
                    selectedInvitation={selectedInvitation}
                    onInvitationGenerated={(invitationId) => {
                        setInvitationId(invitationId)
                        nextStep()
                    }}
                />
            )}
            {step === 3 && <Step3 invitationId={invitationId} nextStep={nextStep} />}
            <LoginDialog open={!!auth && auth.isAnonymous && finishPressed} />
        </div>
    )
}

function Step1({ setApi, nextStep }: { setApi: (api: CarouselApi) => void; nextStep: () => void }) {
    return (
        <>
            <p className="mt-4 text-center">
                We make kids parties easy!
                <br />
                Choose the design of your invite
            </p>
            <div className="flex justify-center pb-24 pt-8">
                <Carousel className="w-[calc(100%-128px)]" setApi={setApi}>
                    <CarouselContent>
                        {INVITATIONS.map((invitation, index) => (
                            <CarouselItem key={index} className="">
                                <div className="p-1">
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
                                            <img src={invitation.src}></img>
                                            <p className="font-semibold">{invitation.name}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
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
    onInvitationGenerated: (invitationId: string) => void
}) {
    return (
        <>
            <p className="my-8 text-center">Put in your details to customise your invitation.</p>
            <CreateInvitationForm selectedInvitationIdx={selectedInvitation} onComplete={onInvitationGenerated} />
        </>
    )
}

function Step3({ invitationId, nextStep }: { invitationId: string; nextStep: () => void }) {
    const firebase = useFirebase()

    const [invitationUrl, setInvitationUrl] = useState('')

    useEffect(() => {
        async function getInvitation() {
            if (invitationId) {
                const url = await firebase.storage
                    .ref()
                    .child(`invitations/${invitationId}/invitation.png`)
                    .getDownloadURL()
                setInvitationUrl(url)
                console.log(url)
            }
        }
        getInvitation()
    }, [invitationId, firebase.storage])

    return (
        <>
            <div className="px-8">
                <p className="my-4 text-center">You're invitation is ready!</p>
                <p className="my-4 text-center">Use the back arrow to edit the details or choose a different design.</p>
                <div className="flex items-center justify-center">
                    <Img src={invitationUrl} loader={<Loader2 className="animate-spin" />} className="h-full border" />
                </div>
                <div className="pb-24" />
            </div>
            <button
                onClick={nextStep}
                className="fixed bottom-0 h-16 w-full bg-[#9B3EEA] text-center font-semibold text-white"
            >
                FINISH AND SHARE
            </button>
        </>
    )
}
