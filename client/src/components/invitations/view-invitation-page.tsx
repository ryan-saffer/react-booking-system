import { InvitationOption } from 'fizz-kidz'
import { ExternalLink, Loader2, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ScrollRestoration, useParams, useSearchParams } from 'react-router-dom'
import { Toaster, toast } from 'sonner'

import useFirebase from '@components/Hooks/context/UseFirebase'
import * as Logo from '@drawables/fizz-logo.png'
import { Button } from '@ui-components/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@ui-components/card'
import { Dialog, DialogContent } from '@ui-components/dialog'
import { Drawer, DrawerContent } from '@ui-components/drawer'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { ScrollArea } from '@ui-components/scroll-area'
import { generateRandomString } from '@utils/stringUtilities'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

import { InvitationTemplates } from './constants'

type Params = {
    id: string
}

export const ViewInvitationPage = () => {
    const { id } = useParams<Params>()
    const [searchParams] = useSearchParams()

    const firebase = useFirebase()

    const [loading, setLoading] = useState(true)
    const [invitationUrl, setInvitationUrl] = useState('')

    const [useBottomNav] = useState(Math.random() > 0.5)

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

    return (
        <div className="twp">
            <ScrollRestoration />
            <Navbar />
            <Toaster richColors />
            <main className="flex h-full w-full justify-center max-[1060px]:pb-[100px]">
                <div className="flex h-[calc(100vh-208px)] w-full max-w-[1220px] flex-col min-[1060px]:h-[716px]">
                    <div className="z-50 flex items-center gap-2 bg-white p-2">
                        <p className="bg-clip-text font-lilita text-xl">You've been invited to a Fizz Kidz party!</p>
                    </div>

                    <div className="relative flex h-screen w-full flex-grow flex-col justify-center min-[1060px]:min-h-[646px]">
                        <div className="relative flex h-[calc(100vh-208px)] w-full justify-center min-[1060px]:h-[724px]">
                            <div className="pattern-opacity-30 pattern-wavy absolute h-full w-full pattern-bg-white pattern-purple-400 pattern-size-1"></div>
                            {loading && (
                                <div className="absolute left-1/2 top-1/2 z-20 flex translate-x-[-50%] translate-y-[-50%] items-center justify-center rounded-xl bg-white p-4">
                                    <Loader2 className="animate-spin" />
                                </div>
                            )}
                            <div
                                className={cn(
                                    'relative hidden w-full items-center justify-center opacity-100 transition-opacity duration-700 ease-in min-[720px]:flex',
                                    loading && 'opacity-0'
                                )}
                            >
                                <div className="absolute left-1/2 top-1/2 z-20 w-[450px] translate-x-[-70%] translate-y-[-50%]">
                                    <img src={invitationUrl} />
                                </div>
                                <div className="absolute left-1/2 top-1/2 z-10 w-[430px] translate-x-[-20%] translate-y-[-50%]">
                                    <img
                                        src={InvitationTemplates[searchParams.get('type') as InvitationOption].envelope}
                                    />
                                </div>
                            </div>
                            <div
                                className={cn(
                                    'absolute m-6 mt-16 opacity-100 transition-opacity duration-700 ease-in min-[720px]:hidden',
                                    loading && 'opacity-0'
                                )}
                            >
                                <img src={invitationUrl} className="max-h-[calc(100vh-290px)]" />
                            </div>
                            {!useBottomNav && (
                                <div className="absolute top-[calc(100vh-208px)] z-50 hidden bg-white pb-4 max-[1060px]:block">
                                    <PartyDetails viewUsed="scroll" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Sidebar />
                {useBottomNav && <BottomNav />}
            </main>
        </div>
    )
}

function Navbar() {
    const [showMenu, setShowMenu] = useState(false)

    return (
        <div className="sticky z-[999] flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 shadow-lg lg:justify-normal">
            <a href="https://www.fizzkidz.com.au">
                <img src={Logo.default} className="top-0 m-1 w-32"></img>
            </a>
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
        <section className="hidden h-[765px] min-[1060px]:block">
            <div className="flex h-full w-[380px] border-l border-gray-200">
                <PartyDetails viewUsed="sidebar" />
            </div>
        </section>
    )
}

type TForm = {
    name: string
    email: string
}

function PartyDetails({ viewUsed }: { viewUsed: 'sidebar' | 'drawer' | 'scroll' }) {
    const { id } = useParams<Params>()

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
                invitationId: id!,
                viewUsed,
                numberOfUsesAllocated: 1,
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
                <div className="mb-8 flex flex-col p-4">
                    <h2 className="font-lilita text-lg md:text-xl">Welcome to the world of Fizz Kidz</h2>
                    <div className="mb-4 mt-4 h-[0.5px] w-full bg-gray-500"></div>
                    <p className="font-gotham">
                        You can download and save your invitation to your phone by choosing 'Download invitation' from
                        the menu.
                    </p>
                </div>
                <Card className="mx-3 border-8 border-cyan-400">
                    <Form {...form}>
                        <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
                            <img
                                src="https://fizzkidz.com.au/wp-content/uploads/2024/02/science.jpg"
                                className="h-28 w-full object-cover"
                            />
                            <CardHeader className="space-y-1 py-0">
                                <h2 className="font-lilita text-xl">Hello friend!</h2>
                                <CardDescription>
                                    As a guest of a Fizz Kidz party, you are eligible to{' '}
                                    <span className="text-lg font-extrabold text-pink-500">10% off</span> our upcoming
                                    holiday programs!
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
                                    className="w-full rounded-2xl bg-fuchsia-700 hover:bg-fuchsia-900"
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
                <DialogContent className="twp flex flex-col rounded-md p-6">
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
                <p className="font-semibold text-slate-800">Welcome to the world of Fizz Kidz.</p>
                <Button
                    className="w-full rounded-2xl bg-fuchsia-700 hover:bg-fuchsia-900"
                    onClick={() => setOpen(true)}
                >
                    View Details
                </Button>
                <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerContent className="twp h-4/5 px-4">
                        <ScrollArea>
                            <PartyDetails viewUsed="drawer" />
                            <div className="mb-8" />
                        </ScrollArea>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    )
}
