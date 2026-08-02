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

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    loading: boolean
    count: number
    onConfirm: () => Promise<void>
}

export function UnenrollEnrolmentsDialog({ open, onOpenChange, loading, count, onConfirm }: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="twp">
                <AlertDialogHeader>
                    <AlertDialogTitle>Unenrol from term?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will cancel all Acuity appointments for the selected {count === 1 ? 'child' : 'children'}{' '}
                        and remove the enrolment{count === 1 ? '' : 's'} from Firestore. This cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={loading} onClick={() => void onConfirm()}>
                        Unenrol
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
