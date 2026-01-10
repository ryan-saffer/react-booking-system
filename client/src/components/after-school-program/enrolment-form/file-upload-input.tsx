import { forwardRef, useRef, useState } from 'react'
import { toast } from 'sonner'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { Progress } from '@ui-components/progress'
import { cn } from '@utils/tailwind'
import { ref, uploadBytesResumable } from 'firebase/storage'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onSuccess: (file: File) => void
}

const FileUploadInput = forwardRef<HTMLInputElement, InputProps>(({ className, accept, onSuccess, ...props }, ref) => {
    const firebase = useFirebase()

    const inputRef = useRef<HTMLInputElement | null>(null)

    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const isValidFile = (file: File) => {
        const isPdf = file.type === 'application/pdf'
        if (!isPdf) {
            toast.error('File must be a pdf')
            return false
        }
        const isLt5M = file.size / 1024 / 1024 < 5
        if (!isLt5M) {
            toast.error('Document must be smaller than 5MB.')
            return false
        }
        return true
    }

    const upload = (file: File) => {
        if (!isValidFile(file)) {
            if (inputRef.current) {
                inputRef.current.value = ''
            }
            return
        }

        setUploading(true)
        const path = `anaphylaxisPlans/${file.name}`
        const storageRef = ref(firebase.storage, path)
        const uploadTask = uploadBytesResumable(storageRef, file, { contentType: 'application/pdf' })
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                setProgress(Math.round(progress))
            },
            (error) => {
                console.error('error', error)
                setUploading(false)
                toast.error('Error occured during upload')
            },
            () => {
                setUploading(false)
                onSuccess(file)
            }
        )
    }

    return (
        <>
            <input
                {...props}
                type="file"
                accept={accept}
                className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                ref={(node) => {
                    if (ref) {
                        if (typeof ref === 'function') {
                            ref(node)
                        } else {
                            ref.current = node
                        }
                    }
                    inputRef.current = node
                }}
                onChange={(e) => e.target.files && upload(e.target.files[0])}
                disabled={uploading}
            />
            {uploading && <Progress value={progress} />}
        </>
    )
})
FileUploadInput.displayName = 'FileUploadInput'

export { FileUploadInput }
