import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Img } from 'react-image'
import { useNavigate } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
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

import { useRouterState } from '../../Hooks/use-router-state'
import { INVITATIONS } from '../constants/invitations'
import { CreateInvitationForm } from '../create-invitation-form'
import { Navbar } from '../navbar'
import { InvitationState } from '../types'

export function ChooseInvitationPage() {
    const state = useRouterState<InvitationState>()

    const childName = state.childName || ''

    const [step, setStep] = useState(3)
    const [invitationId, setInvitationId] = useState('BTWs4KNVGL3SBMqeJkQl')

    const navigate = useNavigate()

    const [api, setApi] = useState<CarouselApi>()
    const [selectedInvitation, setSelectedInvitation] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }

        setSelectedInvitation(api.selectedScrollSnap())

        api.on('select', () => {
            setSelectedInvitation(api.selectedScrollSnap())
        })
    }, [api])

    function nextStep() {
        setStep((prev) => prev + 1)
    }

    function goBack() {
        if (step === 1) {
            navigate(-1)
            // navigate('choose', { state })
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
            {step === 3 && <Step3 invitationId={invitationId} />}
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
            <div className="flex justify-center pt-8">
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
            <p className="mt-4 text-center">
                Now let's put in your details to customise and share your invitation and manage your RSVP
            </p>
            <CreateInvitationForm selectedInvitationIdx={selectedInvitation} onComplete={onInvitationGenerated} />
        </>
    )
}

function Step3({ invitationId }: { invitationId: string }) {
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
            <p className="my-4 text-center">You're invitation is ready!</p>
            <div className="flex items-center justify-center px-8 ">
                <Img src={invitationUrl} loader={<Loader2 className="animate-spin" />} className="h-full" />
            </div>
            <Button className="mx-auto my-4 flex justify-center rounded-3xl bg-gray-800 px-16">Edit</Button>
            <div className="pb-32" />
            <div className="fixed bottom-0 w-full">
                <div className="flex">
                    <button className="h-16 w-1/2 bg-[#02D7F7] font-semibold">DOWNLOAD</button>
                    <button className="h-16 w-1/2 bg-[#FFDC5D] font-semibold">SHARE</button>
                </div>
                <button className="h-16 w-full bg-[#9B3EEA] text-center font-semibold text-white">NEXT</button>
            </div>
        </>
    )
}
