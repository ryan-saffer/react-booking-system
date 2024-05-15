import { ReactNode, createContext, useCallback, useRef, useState } from 'react'

import { Button } from '@ui-components/button'
import { Checkbox } from '@ui-components/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@ui-components/dialog'

type Props = {
    title: string
    description: string
    checkboxLabel: string
    confirmButton: string
}

type Result = {
    confirmed: boolean
    checked: boolean
}

export const ConfirmationDialogWithCheckboxContext = createContext<(props: Props) => Promise<Result>>(
    () => new Promise((resolve) => resolve({ confirmed: false, checked: false }))
)

export function ConfirmationDialogWithCheckboxProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState({
        open: false,
        title: '',
        description: '',
        checkboxLabel: '',
        confirmButton: '',
        isChecked: true,
    })

    const fn = useRef<(result: Result) => void>(() => {})

    const confirm = useCallback(
        (data: Props) =>
            new Promise<Result>((resolve) => {
                setState({ ...data, isChecked: true, open: true })
                fn.current = (result) => {
                    resolve(result)
                    setState((prevState) => ({ ...prevState, open: false }))
                }
            }),
        [setState]
    )

    return (
        <ConfirmationDialogWithCheckboxContext.Provider value={confirm}>
            {children}
            <Dialog open={state.open} onOpenChange={() => fn.current({ confirmed: false, checked: state.isChecked })}>
                <DialogContent className="twp max-w-md">
                    <DialogHeader>
                        <DialogTitle>{state.title}</DialogTitle>
                        <DialogDescription>{state.description}</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="checkbox"
                            checked={state.isChecked}
                            onClick={() => setState((prevState) => ({ ...prevState, isChecked: !prevState.isChecked }))}
                        />
                        <label
                            htmlFor="checkbox"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {state.checkboxLabel}
                        </label>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => fn.current({ confirmed: false, checked: state.isChecked })}
                        >
                            Cancel
                        </Button>
                        <Button onClick={() => fn.current({ confirmed: true, checked: state.isChecked })}>
                            {state.confirmButton}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ConfirmationDialogWithCheckboxContext.Provider>
    )
}
