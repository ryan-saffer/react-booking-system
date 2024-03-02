import 'react-social-icons/whatsapp'

import { format } from 'date-fns'
import { InvitationOption, Location, capitalise, getApplicationDomain } from 'fizz-kidz'
import { CalendarIcon, Copy, ExternalLink, Loader2, Mail, MessageCircleMore } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { Img } from 'react-image'
import { Link, ScrollRestoration, useLocation } from 'react-router-dom'
import { WhatsappShareButton } from 'react-share'
import { SocialIcon } from 'react-social-icons/component'
import { Toaster, toast } from 'sonner'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { INVITATIONS } from '@constants/routes'
import { Button } from '@ui-components/button'
import { Calendar } from '@ui-components/calendar'
import { Dialog, DialogContent } from '@ui-components/dialog'
import { Drawer, DrawerContent } from '@ui-components/drawer'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Label } from '@ui-components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { ScrollArea } from '@ui-components/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Separator } from '@ui-components/separator'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

import { InvitationTemplates } from './constants'
import { Navbar } from './navbar'

type TForm = {
    childName: string
    childAge: string
    date: Date
    time: string
    type: 'studio' | 'mobile' | ''
    studio: Location
    address: string
    rsvpName: string
    rsvpDate: Date
    rsvpNumber: string
}

export const CreateInvitationPage = () => {
    const { state } = useLocation()

    const form = useForm<TForm>({
        defaultValues: {
            childName: state?.childName || '',
            childAge: state?.childAge || '',
            date: state?.date || '',
            time: state?.time || '',
            type: state?.type || '',
            studio: state?.studio || '',
            address: state?.address || '',
            rsvpName: state?.rsvpName || '',
            rsvpDate: state?.rsvpDate || '',
            rsvpNumber: state?.rsvpNumber || '',
        },
    })

    return (
        <div className="twp">
            <ScrollRestoration />
            <Toaster richColors />
            <Navbar />
            <main className="flex w-full justify-center max-[1060px]:pb-[100px]">
                <div className="flex w-full max-w-[1220px] flex-col">
                    <div className="flex items-center gap-2 p-2">
                        <Link
                            to={INVITATIONS}
                            state={{
                                childName: form.getValues().childName,
                                childAge: form.getValues().childAge,
                                date: form.getValues().date,
                                time: form.getValues().time,
                                type: form.getValues().type,
                                studio: form.getValues().studio,
                                address: form.getValues().address,
                                rsvpName: form.getValues().rsvpName,
                                rsvpDate: form.getValues().rsvpDate,
                                rsvpNumber: form.getValues().rsvpNumber,
                            }}
                        >
                            <Button variant="ghost" size="sm">
                                Invitations
                            </Button>
                        </Link>
                        /
                        <Button variant="ghost" size="sm">
                            {state.invitation}
                        </Button>
                    </div>
                    {/* 724px is 840px (sidebar height) - 52px (navbar + breadcrumbs) */}
                    <div className="relative flex h-screen max-h-[776px] w-full justify-center min-[700px]:max-h-[776px]">
                        <div className="pattern-wavy pattern-purple-400 pattern-bg-white pattern-size-1 pattern-opacity-30 absolute h-full w-full"></div>
                        <div className="relative hidden w-full items-center justify-center min-[700px]:flex">
                            <div className="absolute left-1/2 top-1/2 z-20 w-[450px] translate-x-[-70%] translate-y-[-50%]">
                                <img src={InvitationTemplates[state.invitation as InvitationOption].invitation} />
                            </div>
                            <div className="absolute left-1/2 top-1/2 z-10 w-[450px] max-w-[450px] translate-x-[-30%] translate-y-[-50%]">
                                <img src={InvitationTemplates[state.invitation as InvitationOption].envelope} />
                            </div>
                        </div>
                        <div className="absolute m-6 max-h-[550px] min-[700px]:hidden">
                            <img
                                src={InvitationTemplates[state.invitation as InvitationOption].invitation}
                                className="max-h-[550px]"
                            />
                        </div>
                    </div>
                </div>
                <FormProvider {...form}>
                    <Sidebar />
                    <BottomNav />
                </FormProvider>
            </main>
        </div>
    )
}

function Sidebar() {
    return (
        <section className="hidden h-screen min-[1060px]:block">
            <div className="flex h-full w-full border-l border-gray-200">
                <div className="w-[380px]">
                    <CustomiseForm />
                </div>
            </div>
        </section>
    )
}

function CustomiseForm({ onClose }: { onClose?: () => void }) {
    const { isLoading, mutateAsync: generateInvitation } = trpc.parties.generateInvitation.useMutation()

    const [open, setOpen] = useState(false)
    const [invitationId, setInvitationId] = useState('')

    const form = useFormContext<TForm>()

    // used to close calendar popover after date selection
    const [isDateCalendarOpen, setIsDateCalendarOpen] = useState(false)
    const [isRsvpCalendarOpen, setIsRsvpCalendarOpen] = useState(false)

    const { state } = useLocation()

    const onSubmit = async (values: TForm) => {
        try {
            let result = ''
            if (values.type === 'studio') {
                result = await generateInvitation({
                    childName: values.childName,
                    childAge: values.childAge,
                    time: values.time,
                    date: values.date,
                    $type: 'studio',
                    studio: values.studio,
                    rsvpName: values.rsvpName,
                    rsvpDate: values.rsvpDate,
                    rsvpNumber: values.rsvpNumber,
                    invitation: state.invitation,
                })
            } else if (values.type === 'mobile') {
                result = await generateInvitation({
                    childName: values.childName,
                    childAge: values.childAge,
                    time: values.time,
                    date: values.date,
                    $type: 'mobile',
                    address: values.address,
                    rsvpName: values.rsvpName,
                    rsvpDate: values.rsvpDate,
                    rsvpNumber: values.rsvpNumber,
                    invitation: state.invitation,
                })
            }

            setInvitationId(result)
            setOpen(true)
        } catch (err) {
            console.error(err)
            toast.error('There was an error generating your invitation.')
        }
    }

    return (
        <div className="flex flex-col p-4">
            <h1 className="font-lilita text-2xl">Customise your invitation and send to your kids' friends!</h1>
            <p className="mt-2 font-semibold text-slate-400">Magical Party Time</p>
            <div className="mb-4 mt-4 h-[0.5px] w-full bg-gray-500"></div>
            <Form {...form}>
                <form className="space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        rules={{ required: true }}
                        name="childName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Child's Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Child's Name" autoComplete="off" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="childAge"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Child's Age</FormLabel>
                                <FormControl>
                                    <Input placeholder="Child's Age" autoComplete="off" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Party Date</FormLabel>
                                <Popover open={isDateCalendarOpen} onOpenChange={setIsDateCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                            >
                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="twp w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(e) => {
                                                field.onChange(e)
                                                setIsDateCalendarOpen(false)
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="time"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time (Ie 10am - 11:30am)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Time" autoComplete="off" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem className={form.watch('type') === '' ? 'pb-2' : ''}>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormLabel>Party Location</FormLabel>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select the parties location" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent
                                        // https://github.com/shadcn-ui/ui/issues/2620#issuecomment-1918404840
                                        ref={(ref) => {
                                            if (!ref) return
                                            ref.ontouchstart = (e) => e.preventDefault()
                                        }}
                                    >
                                        <SelectItem value="studio">Fizz Kidz studio</SelectItem>
                                        <SelectItem value="mobile">Mobile Party (at home)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    {form.watch('type') === 'studio' && (
                        <FormField
                            control={form.control}
                            name="studio"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormLabel>Studio</FormLabel>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a studio" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent
                                            // https://github.com/shadcn-ui/ui/issues/2620#issuecomment-1918404840
                                            ref={(ref) => {
                                                if (!ref) return
                                                ref.ontouchstart = (e) => e.preventDefault()
                                            }}
                                        >
                                            {Object.values(Location).map((location) => (
                                                <SelectItem key={location} value={location}>
                                                    {capitalise(location)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    )}
                    {form.watch('type') === 'mobile' && (
                        <FormField
                            control={form.control}
                            name="address"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Address" autoComplete="off" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="rsvpName"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem className="pb-2">
                                <FormLabel>RSVP Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="RSVP Name" autoComplete="off" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="rsvpDate"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>RSVP Date</FormLabel>
                                <Popover open={isRsvpCalendarOpen} onOpenChange={setIsRsvpCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                            >
                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="twp w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(e) => {
                                                field.onChange(e)
                                                setIsRsvpCalendarOpen(false)
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="rsvpNumber"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem className="pb-4">
                                <FormLabel>RSVP Mobile Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="RSVP Mobile Number" autoComplete="off" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full rounded-2xl bg-fuchsia-700 hover:bg-fuchsia-900"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            'Generate!'
                        )}
                    </Button>
                </form>
            </Form>
            <SuccessDialog
                isOpen={open}
                close={() => {
                    setOpen(false)
                    onClose?.()
                }}
                childName={form.getValues('childName')}
                invitationId={invitationId}
            />
        </div>
    )
}

function BottomNav() {
    const [open, setOpen] = useState(false)
    return (
        <div className="fixed bottom-0 z-50 hidden h-[100px] w-full border-t-[0.5px] border-gray-300 bg-white max-[1060px]:block">
            <div className="flex h-full w-full flex-col justify-center gap-4 p-4">
                <p className="font-semibold text-slate-800">Magical Party Time</p>
                <Button
                    className="w-full rounded-2xl bg-fuchsia-700 hover:bg-fuchsia-900"
                    onClick={() => setOpen(true)}
                >
                    Customise
                </Button>
                <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerContent className="twp h-4/5 px-4">
                        <ScrollArea>
                            <CustomiseForm onClose={() => setOpen(false)} />
                        </ScrollArea>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    )
}

function SuccessDialog({
    isOpen,
    close,
    childName,
    invitationId,
}: {
    isOpen: boolean
    close?: () => void
    childName?: string
    invitationId?: string
}) {
    const { state } = useLocation()
    const invitationText = `You're invited to ${childName}'s party!`
    const inviteUrl = `${getApplicationDomain(import.meta.env.VITE_ENV)}/invitation/${invitationId}?type=${encodeURIComponent(state.invitation)}`

    const combinedMessage = `${invitationText} | ${inviteUrl}`

    const copy = () => {
        navigator.clipboard.writeText(combinedMessage)
        toast.success('Invitation copied to clipboard!')
    }

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
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="twp">
                <div className="flex flex-col p-4">
                    <h5 className="font-lilita text-2xl">Let the party begin!</h5>
                    <p className="mt-2 font-gotham">Share your invitation with all of {childName}'s friends.</p>
                    <Separator className="mb-4 mt-4" />
                    <div className="flex h-[400px] items-center justify-center">
                        <Img src={invitationUrl} loader={<Loader2 className="animate-spin" />} className="h-full" />
                    </div>
                    <Separator className="mb-4 mt-4" />
                    <div className="flex gap-2">
                        <Input value={inviteUrl} readOnly />
                        <Button variant="outline" onClick={copy}>
                            <Copy className="h-6 w-6" />
                        </Button>
                    </div>
                    <Separator className="mb-4 mt-4" />
                    <div className="grid grid-cols-2 items-center justify-center p-4 min-[350px]:grid-cols-4">
                        <div className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg p-2 hover:bg-slate-100">
                            <WhatsappShareButton id="whatsapp" title={invitationText} url={inviteUrl} separator=" | ">
                                <SocialIcon network="whatsapp" style={{ width: 36, height: 36 }} />
                            </WhatsappShareButton>
                            <Label htmlFor="whatsapp" className="mt-2 cursor-pointer">
                                Whatsapp
                            </Label>
                        </div>
                        <div
                            className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg p-2 hover:bg-slate-100"
                            onClick={() => window.open(`sms://?body=${encodeURIComponent(combinedMessage)}`)}
                        >
                            <MessageCircleMore id="sms" className="h-9 w-9" />
                            <Label htmlFor="sms" className="mt-2 cursor-pointer">
                                SMS
                            </Label>
                        </div>
                        <div
                            className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg p-2 hover:bg-slate-100"
                            onClick={() =>
                                window.open(
                                    `mailto: ?subject=${encodeURIComponent(invitationText)}&body=${encodeURIComponent(combinedMessage)}`
                                )
                            }
                        >
                            <Mail id="email" className="h-9 w-9" />
                            <Label htmlFor="email" className="mt-2 cursor-pointer">
                                Email
                            </Label>
                        </div>
                        <div
                            className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg p-2 hover:bg-slate-100"
                            onClick={copy}
                        >
                            <Copy id="copy" className="h-9 w-9" />
                            <Label htmlFor="copy" className="mt-2 cursor-pointer">
                                Copy
                            </Label>
                        </div>
                    </div>
                    <Separator className="mb-4 mt-4" />
                    <Button
                        className="rounded-2xl bg-fuchsia-700 hover:bg-fuchsia-900"
                        onClick={() => window.open(inviteUrl, '_blank')}
                    >
                        View Invitation Page
                        <ExternalLink className="ml-4 h-4 w-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
