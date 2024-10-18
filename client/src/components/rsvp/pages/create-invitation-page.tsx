import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@ui-components/button'

import { Navbar } from '../navbar'
import { hasRequiredState } from '../utils/has-required-state'

// http://localhost:3000/invitation/v2?parentName=Ryan&parentMobile=0413892120&childName=Marlee&bookingId=0GSCAS0KUU7b2YffTXPR&childAge=5&date=2024-10-06T06%3A56%3A38.673Z&time=10am&$type=studio&studio=essendon&rsvpDate=2024-10-06T06%3A56%3A38.673Z
// http://localhost:3000/invitation/v2?parentName=Ryan&parentMobile=0413892120&childName=Marlee&bookingId=1t29Q2jfALbvD4R4xpul&childAge=5&date=2024-10-06T06%3A56%3A38.673Z&time=10am&$type=studio&studio=essendon&rsvpDate=2024-10-06T06%3A56%3A38.673Z

export function CreateInvitationPage() {
    const [searchParams] = useSearchParams()

    const navigate = useNavigate()

    const childName = searchParams.get('childName')
    const childAge = searchParams.get('childAge')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const $type = searchParams.get('$type')
    const studio = searchParams.get('studio')
    const address = searchParams.get('address')
    const parentName = searchParams.get('parentName')
    const parentMobile = searchParams.get('parentMobile')
    const rsvpDate = searchParams.get('rsvpDate')
    const bookingId = searchParams.get('bookingId')

    const hasRequiredQueryParams = hasRequiredState(
        bookingId,
        parentName,
        parentMobile,
        childName,
        childAge,
        date,
        time,
        $type,
        studio,
        address,
        rsvpDate
    )

    async function navigateToDesignInvitation() {
        navigate('design', {
            state: {
                bookingId,
                childName,
                childAge,
                parentName,
                parentMobile,
                date: new Date(date!), // serialize into real date
                time,
                $type,
                studio,
                address,
                rsvpDate: new Date(rsvpDate!), // serialize into real date
            },
        })
    }

    return (
        <div className="twp">
            <Navbar />
            <main className="px-8 py-4">
                {!hasRequiredQueryParams ? (
                    <p>To generate an invitation, please open the link from the email you were sent.</p>
                ) : (
                    <>
                        {childName && parentName && (
                            <>
                                <p className="text-center font-lilita text-5xl ">{childName}'s party is booked in!</p>
                                <p className="m-auto my-6 flex max-w-3xl justify-center">
                                    Hi {parentName},
                                    <br />
                                    <br />
                                    Now that {childName}'s party is booked in, let's create an invitation and invite
                                    their friends! This tool will help you pick and generate a unique invitation just
                                    for you, and allow you to track your RSVP's.
                                </p>
                            </>
                        )}
                        <p className="my-4 text-center text-xl font-extrabold">
                            Get Your Party Organised in a Few Simple Steps
                        </p>
                        <div className="flex flex-col gap-4">
                            <Step number="1" content="Choose the design" />
                            <Step number="2" content="Input your details" />
                            <Step number="3" content="Invite friends" />
                            <Step number="4" content="Manage RSVP" />
                        </div>
                        <div className="mt-8 flex justify-center">
                            <Button
                                onClick={navigateToDesignInvitation}
                                className="m-auto rounded-3xl bg-[#9B3EEA] text-center hover:bg-[#9B3EEA]/80"
                            >
                                Let's do it
                            </Button>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}

function Step({ number, content }: { number: string; content: string }) {
    return (
        <div className="flex flex-col items-center justify-center">
            <p className="m-0 font-lilita text-5xl text-[#9B3EEA]">{number}</p>
            <p>{content}</p>
        </div>
    )
}
