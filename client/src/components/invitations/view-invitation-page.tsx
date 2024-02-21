import { Download, ExternalLink, Loader2, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ScrollRestoration, useParams } from 'react-router-dom'
import { Toaster, toast } from 'sonner'

import useFirebase from '@components/Hooks/context/UseFirebase'
import * as Envelope from '@drawables/envelope.png'
import * as Logo from '@drawables/fizz-logo.png'
import * as Background from '@drawables/unicorn_background.jpeg'
import { Button } from '@ui-components/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@ui-components/card'
import { Dialog, DialogContent } from '@ui-components/dialog'
import { Drawer, DrawerContent } from '@ui-components/drawer'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui-components/dropdown-menu'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { ScrollArea } from '@ui-components/scroll-area'
import { generateRandomString } from '@utils/stringUtilities'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const downloadInvitation = async () => {
        const response = await fetch(invitationUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'Fizz Kidz Invitation.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="twp">
            <ScrollRestoration />
            <Navbar />
            <Toaster richColors />
            <main className="flex w-full justify-center max-[1060px]:pb-[100px]">
                <div className="flex h-[710px] w-full max-w-[1220px] flex-col">
                    <div className="flex items-center gap-2 p-2">
                        <p className="text-md h-8 p-2">Time to celebrate!</p>
                    </div>

                    <div className="relative flex w-full flex-grow justify-center min-[1060px]:min-h-[646px]">
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
                                <DropdownMenuItem
                                    className="flex h-6 cursor-pointer items-center justify-between"
                                    onClick={downloadInvitation}
                                >
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
                            <div className="">
                                <div className="absolute left-1/2 top-1/2 z-20 flex translate-x-[-50%] translate-y-[-50%] items-center justify-center rounded-xl bg-white p-4">
                                    <Loader2 className="animate-spin" />
                                </div>
                            </div>
                        )}
                        <div
                            className={cn(
                                'flex w-full justify-center opacity-100 transition-opacity duration-700 ease-in',
                                loading && 'opacity-0'
                            )}
                        >
                            <div className="relative mb-12 mt-12 flex w-[70%] justify-normal max-[1060px]:justify-center">
                                <img className="z-20 w-full max-w-[400px] object-contain" src={invitationUrl} />
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
        </div>
    )
}

function Navbar() {
    const [showMenu, setShowMenu] = useState(false)

    return (
        <div className="sticky z-[999] flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 shadow-lg lg:justify-normal">
            <img src={Logo.default} className="top-0 m-1 w-32"></img>
            <div className="flex items-center justify-center gap-2">
                <a href="https://www.fizzkidz.com.au/book-a-party" className="hidden lg:block">
                    <Button variant="ghost">Book a Party</Button>
                </a>
                <a href="https://www.fizzkidz.com.au/holiday-programs" className="hidden lg:block">
                    <Button variant="ghost">Holiday Programs</Button>
                </a>
                <a href="https://fizzkidz.com.au/school-science/" className="hidden lg:block">
                    <Button variant="ghost">After School Programs</Button>
                </a>
                <a href="https://fizzkidz.com.au/contact-us/" className="hidden lg:block">
                    <Button variant="ghost">Get in touch</Button>
                </a>
            </div>
            <Button variant="ghost" className="lg:hidden" onClick={() => setShowMenu((prev) => !prev)}>
                <Menu color="#F88EC3" />
            </Button>
            <div
                className={cn(
                    'invisible absolute left-0 top-16 z-[999] flex h-0 w-full flex-col gap-2 bg-white p-4 opacity-0 shadow-md transition-all duration-500 ease-in-out lg:hidden',
                    showMenu && 'visible h-[216px] opacity-100'
                )}
            >
                <a href="https://www.fizzkidz.com.au/book-a-party">
                    <Button variant="outline" className="w-full">
                        Book a Party
                    </Button>
                </a>
                <a href="https://www.fizzkidz.com.au/holiday-programs">
                    <Button variant="outline" className="w-full">
                        Holiday Programs
                    </Button>
                </a>
                <a href="https://fizzkidz.com.au/school-science/">
                    <Button variant="outline" className="w-full">
                        After School Programs
                    </Button>
                </a>
                <a href="https://fizzkidz.com.au/contact-us/">
                    <Button variant="outline" className="w-full">
                        Get in touch
                    </Button>
                </a>
            </div>
        </div>
    )
}

function Sidebar() {
    return (
        <section className="hidden h-screen min-[1060px]:block">
            <div className="flex h-[710px] w-[380px] border-l border-gray-200">
                <PartyDetails />
            </div>
        </section>
    )
}

type TForm = {
    name: string
    email: string
}

function PartyDetails() {
    const [submitting, setSubmitting] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)

    const form = useForm<TForm>({ defaultValues: { name: '', email: '' } })
    const createDiscountCodeMutation = trpc.holidayPrograms.createDiscountCode.useMutation()

    const onSubmit = async (values: TForm) => {
        setSubmitting(true)
        try {
            await createDiscountCodeMutation.mutateAsync({
                discountType: 'percentage',
                discountAmount: 10,
                code: `${values.name}-${generateRandomString(5)}`,
                expiryDate: 'auto-upcoming',
                name: values.name,
                email: values.email,
            })
            setOpenDialog(true)
        } catch {
            toast.error('Something went wrong generating your discount code.')
        }
        setSubmitting(false)
    }

    return (
        <>
            <div className="flex h-full flex-col justify-between">
                <div className="flex flex-col p-4">
                    <h2 className="font-lilita text-2xl">You've been invited to a Fizz Kidz party!</h2>
                    <p className="mt-2 font-semibold text-slate-400">We can't wait to see you there.</p>
                    <div className="mb-4 mt-4 h-[0.5px] w-full bg-gray-500"></div>
                    <p className="font-gotham">
                        A paragraph about what it means to be invited to a Fizz Kidz party, and maybe some tips
                        regarding staying or dropping off etc.
                    </p>
                    <p className="pt-4 font-gotham">
                        You can download and save the invitation to your phone by choosing 'Donwload Invitation' from
                        the menu.
                    </p>
                </div>
                <Card className="mx-3 mt-3 bg-gray-100">
                    <Form {...form}>
                        <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
                            <CardHeader className="space-y-1">
                                <h2 className="font-lilita text-xl">Special Offer</h2>
                                <CardDescription>
                                    As a guest of a Fizz Kidz party, you are eligible to 10% off our upcoming holiday
                                    programs!
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <FormField
                                    control={form.control}
                                    rules={{ required: true }}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input id="name" type="text" autoComplete="off" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    rules={{ required: true }}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input id="email" type="email" autoComplete="off" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    className="w-full bg-fuchsia-700 hover:bg-fuchsia-900"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating discount code...
                                        </>
                                    ) : (
                                        'Claim my 10% discount code'
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="twp flex min-h-64 flex-col">
                    <p className="font-lilita text-2xl">You're discount code has been sent!</p>
                    <p className="text-sm">
                        We have sent you an email that includes your discount code. You can use it when signing up to
                        our holiday programs.
                    </p>
                    <p className="text-sm">
                        Click on the button below to see our upcoming holiday program schedule 😄.
                    </p>
                    <a href="https://www.fizzkidz.com.au/holiday-programs">
                        <Button className="w-full bg-fuchsia-700 text-white hover:bg-fuchsia-900">
                            Holiday Programs Schedule <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </a>
                </DialogContent>
            </Dialog>
        </>
    )
}

function BottomNav() {
    const [open, setOpen] = useState(false)
    return (
        <div className="fixed bottom-0 z-50 hidden h-[100px] w-full border-t-[0.5px] border-gray-300 bg-white max-[1060px]:block">
            <div className="flex h-full w-full flex-col justify-center gap-4 p-4">
                <p className="font-semibold text-slate-800">You're invited to a Fizz Kidz party!</p>
                <Button
                    className="w-full rounded-2xl bg-fuchsia-700 hover:bg-fuchsia-900"
                    onClick={() => setOpen(true)}
                >
                    View Details
                </Button>
                <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerContent className="twp h-4/5 px-4">
                        <ScrollArea>
                            <PartyDetails />
                            <div className="mb-8" />
                        </ScrollArea>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    )
}
