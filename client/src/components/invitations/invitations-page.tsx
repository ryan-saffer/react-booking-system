import { RefObject, useEffect, useRef, useState } from 'react'
import { Link, ScrollRestoration, useLocation, useSearchParams } from 'react-router-dom'

import { INVITATION_CREATE } from '@constants/routes'
import * as Logo from '@drawables/fizz-logo.png'
import { Separator } from '@ui-components/separator'
import { cn } from '@utils/tailwind'

export const CreateInvitationPage = () => {
    const stickyRef = useRef<HTMLDivElement>(null)
    const isSticky = useSticky({ ref: stickyRef, offset: 64.5 })

    const [searchParams] = useSearchParams()
    const { state } = useLocation()

    return (
        <div className="twp">
            <ScrollRestoration />
            <div className="fixed top-0 flex h-16 w-full justify-center border-2 border-b border-gray-200 bg-white">
                <img src={Logo.default} className="m-1 w-32"></img>
            </div>
            <main className="mx-auto mt-16 flex w-screen flex-col items-center justify-center pl-8 pr-8">
                <section className="mt-2 flex max-w-5xl flex-col justify-evenly gap-16 md:mt-12 md:flex-row">
                    <div className="mt-6 flex flex-col gap-6 md:max-w-[450px]">
                        <h1 className="font-lilita text-4xl">Fizz Kidz Invitations</h1>
                        <h2 className="font-lilita text-xl text-[#9044E2]">
                            We make kids parties easy!
                        </h2>
                        <p>
                            Simply choose your child's favourite invitation, add your party details, and generate a personalised invitation link to share with all their friends!
                        </p>
                    </div>
                    <div className="box ml-4 mr-4 hidden min-w-[400px] max-w-[400px] items-center justify-center self-center rounded-3xl shadow-purple sm:ml-0 sm:mr-0 sm:max-w-[600px] md:flex min-[900px]:min-w-[450px]">
                        <img
                            src="https://fizzkidz.com.au/wp-content/uploads/2021/01/party.jpg"
                            className="object-fill"
                        ></img>
                    </div>
                </section>
                <Separator className="mb-3 mt-12 w-screen sm:mb-8" />
                <div
                    className={cn(
                        'sticky top-16 flex h-12 w-screen items-center justify-center bg-white',
                        isSticky && 'shadow-md'
                    )}
                    ref={stickyRef}
                >
                    <div className="w-full max-w-5xl pl-8">
                        <h5 className="font-gotham text-xl">Choose a design:</h5>
                    </div>
                </div>
                <section>
                    <div className="mt-0 grid max-w-5xl grid-cols-1 gap-x-32 gap-y-8 md:grid-cols-2  xl:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((it) => (
                            <Link
                                to={INVITATION_CREATE}
                                key={it}
                                state={{
                                    childName: searchParams.get('childName') || state?.childName || '',
                                    childAge: searchParams.get('childAge') || state?.childAge || '',
                                    date: searchParams.get('date') || state?.date || '',
                                    time: searchParams.get('time') || state?.time || '',
                                    type: searchParams.get('type') || state?.type || '',
                                    studio: searchParams.get('studio') || state?.studio || '',
                                    address: searchParams.get('address') || state?.address || '',
                                }}
                                className="flex h-[260px] w-[260px] cursor-pointer flex-col p-4 hover:rounded-xl hover:bg-gray-100 min-[420px]:h-[320px] min-[420px]:w-[320px]"
                            >
                                <img
                                    className="h-[260px] max-h-full max-w-full object-contain"
                                    src="/invite+envelope2.png"
                                />
                                <div className="flex flex-grow items-center justify-center">
                                    <p className="text-center text-sm font-semibold">Magical Party Time</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}

const useSticky = ({ ref, offset }: { ref: RefObject<HTMLElement>; offset: number }) => {
    const [sticky, setSticky] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (ref.current) {
                const scrollPosition = window.scrollY
                const elementPosition = ref.current.offsetTop

                setSticky(scrollPosition >= elementPosition - offset)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [offset, ref])

    return sticky
}
