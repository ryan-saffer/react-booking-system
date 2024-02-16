import { Location, capitalise } from 'fizz-kidz'
import { Loader2 } from 'lucide-react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { Link, ScrollRestoration, useLocation } from 'react-router-dom'

import { INVITATIONS } from '@constants/routes'
import * as Envelope from '@drawables/envelope.png'
import * as Logo from '@drawables/fizz-logo.png'
import * as Background from '@drawables/unicorn_background.jpeg'
import * as Invitation from '@drawables/unicorn_invitation.png'
import { Button } from '@ui-components/button'
import { Dialog, DialogContent, DialogTrigger } from '@ui-components/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { trpc } from '@utils/trpc'

type TForm = {
    childName: string
    childAge: string
    date: string
    time: string
    type: 'studio' | 'mobile' | ''
    studio?: Location
    address?: string
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
        },
    })

    return (
        <div className="twp">
            <ScrollRestoration />
            <div className="sticky flex justify-center border-b border-gray-200 bg-white">
                <img src={Logo.default} className="m-1 w-32"></img>
            </div>
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
                            }}
                        >
                            <Button variant="ghost" size="sm">
                                Invitations
                            </Button>
                        </Link>
                        /
                        <Button variant="ghost" size="sm">
                            Magical Party Time
                        </Button>
                    </div>
                    {/* <h1 className="ml-4 pb-2 pt-2 font-gotham text-lg min-[1620px]:ml-0">Invitation Generator</h1> */}
                    <div className="relative flex w-full justify-center">
                        <img
                            src={Background.default}
                            className="absolute h-full w-full object-cover min-[1060px]:block"
                        />
                        <div className="flex w-full justify-center">
                            <div className="relative mb-12 mt-12 flex w-[70%] justify-normal max-[1060px]:justify-center">
                                <img className="z-20 w-full max-w-[400px] object-contain" src={Invitation.default} />
                                <img
                                    className="relative left-[-200px] z-10 hidden h-[90%] w-full max-w-[400px] self-center object-contain min-[1060px]:block"
                                    src={Envelope.default}
                                />
                            </div>
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

function CustomiseForm() {
    const { isLoading, mutateAsync: generateInvitation } = trpc.parties.generateInvitation.useMutation()

    const form = useFormContext<TForm>()

    const onSubmit = async (values: TForm) => {
        console.log(values)

        const result = await generateInvitation(values)

        console.log('finished')
        console.log('result:', result)
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
                        rules={{ required: "Please enter the child's name" }}
                        name="childName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Child's Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Child's Name" id="childName" autoComplete="off" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="childAge"
                        rules={{ required: "Please enter the child's age" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Child's Age</FormLabel>
                                <FormControl>
                                    <Input placeholder="Child's Age" autoComplete="off" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        rules={{ required: 'Please enter the party date' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input placeholder="Date" autoComplete="off" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="time"
                        rules={{ required: 'Please enter the party time' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                    <Input placeholder="Time" autoComplete="off" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        rules={{ required: 'Please select the parties location' }}
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {form.watch('type') === 'studio' && (
                        <FormField
                            control={form.control}
                            name="studio"
                            rules={{ required: 'Please select a studio' }}
                            render={({ field }) => (
                                <FormItem className="pb-2">
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {form.watch('type') === 'mobile' && (
                        <FormField
                            control={form.control}
                            name="address"
                            rules={{ required: 'Please enter the party address' }}
                            render={({ field }) => (
                                <FormItem className="pb-2">
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Address" autoComplete="off" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
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
                            'Generate'
                        )}
                    </Button>
                </form>
            </Form>
        </div>
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
                    <DialogContent className="twp max-h-screen overflow-y-scroll">
                        <CustomiseForm />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
