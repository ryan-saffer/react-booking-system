import { useEffect, useState } from 'react'
import { Link, ScrollRestoration } from 'react-router-dom'

import { INVITATION_CREATE } from '@constants/routes'
import * as Logo from '@drawables/fizz-logo.png'
import { Separator } from '@ui-components/separator'
import { cn } from '@utils/tailwind'

// import { CreateInvitationSidebar } from './create-invitation-sidebar'

// import { Invitation } from './invitation'

export const CreateInvitationPage = () => {
    const [sticky, setSticky] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY
            const element = document.getElementById('sticky-element')
            const elementPosition = element?.offsetTop

            if (scrollPosition >= (elementPosition || 0) - 64) {
                setSticky(true)
            } else {
                setSticky(false)
            }
        }
        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <>
            <ScrollRestoration />
            <div className="fixed top-0 flex h-16 w-full justify-center border-2 border-b border-gray-200 bg-white">
                <img src={Logo.default} className="m-1 w-32"></img>
            </div>
            <main className="mx-auto mt-16 flex w-screen flex-col  items-center justify-center pl-8 pr-8">
                <section className="mt-2 flex max-w-5xl flex-col justify-evenly gap-12 md:mt-12 md:flex-row">
                    <div className="mt-6 flex flex-col gap-6">
                        <h1 className="font-lilita text-4xl">Fizz Kidz Invitations</h1>
                        <h2 className="font-lilita text-xl text-[#9044E2]">
                            Simply select a design, and we will generate an invite link that you can share however you
                            like.
                        </h2>
                        <p>
                            Just browse the options below, enter your party details, and we will generate a fully
                            personalised invitation for you!
                        </p>
                    </div>
                    <div className="box shadow-purple ml-4 mr-4 flex max-w-[400px] items-center justify-center self-center rounded-3xl sm:ml-0 sm:mr-0 sm:max-w-[600px]">
                        <img
                            src="https://fizzkidz.com.au/wp-content/uploads/2021/01/party.jpg"
                            className="object-fill"
                        ></img>
                    </div>
                </section>
                <Separator className="mb-3 mt-12 w-screen sm:mb-8" />
                <div
                    id="sticky-element"
                    className={cn(
                        'sticky top-16 flex h-12 w-screen items-center justify-center bg-white',
                        sticky && 'shadow-md'
                    )}
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
                                className="flex h-[240px] w-[240px] cursor-pointer flex-col p-4 hover:rounded-xl hover:bg-gray-100 min-[420px]:h-[320px] min-[420px]:w-[320px]"
                            >
                                <img
                                    className="h-[280px] max-h-full max-w-full object-contain"
                                    src="/invitation+envelope.png"
                                />
                                <div className="flex flex-grow items-center justify-center">
                                    <p className="text-center text-sm font-semibold">Magical Party Time</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
                {/* <Invitation invitationUrl="https://fizzkidz.com.au/wp-content/uploads/2024/02/Mobile-Invitation-Option-1.png" /> */}
            </main>
            {/* <CreateInvitationSidebar /> */}
        </>
    )
}
