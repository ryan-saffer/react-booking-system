import { Download, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, ScrollRestoration, useParams } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { INVITATIONS } from '@constants/routes'
import * as Envelope from '@drawables/envelope.png'
import * as Logo from '@drawables/fizz-logo.png'
import * as Background from '@drawables/unicorn_background.jpeg'
import { Button } from '@ui-components/button'
import { Dialog, DialogContent, DialogTrigger } from '@ui-components/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui-components/dropdown-menu'
import { cn } from '@utils/tailwind'

type Params = {
    id: string
}

export const ViewInvitationPage = () => {
    const { id } = useParams<Params>()

    const firebase = useFirebase()

    const [loading, setLoading] = useState(true)
    const [invitationUrl, setInvitationUrl] = useState('')

    useEffect(() => {
        async function getUrl() {
            const url = await firebase.storage.ref().child(`invitations/${id}/invitation.png`).getDownloadURL()
            setInvitationUrl(url)
            // give time for img component to load content
            setTimeout(() => setLoading(false), 500)
        }

        getUrl()
    }, [])

    return (
        <>
            <ScrollRestoration />
            <div className="sticky flex justify-center border-b border-gray-200 bg-white">
                <img src={Logo.default} className="m-1 w-32"></img>
            </div>
            <main className="flex w-full justify-center max-[1060px]:pb-[100px]">
                <div className="flex w-full max-w-[1220px] flex-col">
                    <div className="flex items-center gap-2 p-2">
                        <Link to={INVITATIONS}>
                            <Button variant="ghost" size="sm">
                                Invitations
                            </Button>
                        </Link>
                        /
                        <Button variant="ghost" size="sm">
                            Magical Party Time
                        </Button>
                    </div>

                    <div className="relative flex h-full min-h-[646px] w-full justify-center">
                        <DropdownMenu dir="ltr">
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className={cn(
                                        'absolute right-2 top-2 z-20 transition-opacity duration-700 ease-in',
                                        loading && 'opacity-0'
                                    )}
                                    variant="outline"
                                >
                                    <Menu className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="mr-2 w-56 min-[1060px]:mr-44">
                                <DropdownMenuItem className="flex items-center justify-between">
                                    <span>Download Invitation</span>
                                    <Download className="h-4 w-4" />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <img
                            src={Background.default}
                            className="absolute h-full w-full object-cover min-[1060px]:block"
                        />
                        {loading && (
                            <div className="absolute left-1/2 top-1/2 z-20 flex translate-x-[-50%] translate-y-[-50%] items-center justify-center rounded-xl bg-white p-4">
                                <img src="/fizz_logo.gif" className="h-12 w-12" />
                            </div>
                        )}
                        <div
                            className={cn(
                                'flex h-full w-full justify-center opacity-100 transition-opacity duration-700 ease-in',
                                loading && 'opacity-0'
                            )}
                        >
                            <div className="relative mb-12 mt-12 flex w-[70%] justify-normal max-[1060px]:justify-center">
                                <img
                                    className="z-20 w-full max-w-[500px] object-contain min-[300px]:min-w-[280px] min-[350px]:min-w-[300px] min-[400px]:min-w-[350px] min-[450px]:min-w-[400px]"
                                    src={invitationUrl}
                                />
                                <img
                                    className="relative left-[-200px] z-10 hidden h-[90%] w-full max-w-[400px] self-center object-contain min-[1060px]:block"
                                    src={Envelope.default}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <Sidebar />
                <BottomNav />
            </main>
        </>
    )
}

function Sidebar() {
    return (
        <section className="hidden h-screen min-[1060px]:block">
            <div className="flex h-full w-full border-l border-gray-200">
                <div className="w-[380px]">HI!</div>
            </div>
        </section>
    )
}

function BottomNav() {
    return (
        <div className="fixed bottom-0 z-50 hidden h-[100px] w-full border-t-[0.5px] border-gray-300 bg-white max-[1060px]:block">
            <div className="flex h-full w-full flex-col justify-center gap-4 p-4">
                <p className="font-semibold text-slate-800">Magical Party Time</p>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full rounded-2xl bg-fuchsia-700 hover:bg-fuchsia-900">Customise</Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-screen overflow-y-scroll">{/* <CustomiseForm /> */}</DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
