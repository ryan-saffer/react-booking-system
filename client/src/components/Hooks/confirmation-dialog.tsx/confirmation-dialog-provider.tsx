import type { ReactNode } from 'react'
import { createContext, useCallback, useRef, useState } from 'react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@ui-components/alert-dialog'

type Props = { title: string; description: string }

export const ConfirmationDialogContext = createContext<(props: Props) => Promise<boolean>>(
    () => new Promise((resolve) => resolve(false))
)

export function ConfirmationDialogProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState({
        open: false,
        title: '',
        description: '',
    })

    const fn = useRef<(choice: boolean) => void>(() => {})

    const confirm = useCallback(
        (data: Props) =>
            new Promise<boolean>((resolve) => {
                setState({ ...data, open: true })
                fn.current = (choice) => {
                    resolve(choice)
                    setState((prevState) => ({ ...prevState, open: false }))
                }
            }),
        [setState]
    )

    return (
        <ConfirmationDialogContext value={confirm}>
            {children}
            <AlertDialog open={state.open} onOpenChange={() => fn.current(false)}>
                <AlertDialogContent className="twp">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{state.title}</AlertDialogTitle>
                        <AlertDialogDescription>{state.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => fn.current(true)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ConfirmationDialogContext>
    )
}
