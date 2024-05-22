import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@ui-components/button'

export function ErrorScreen({ label, text }: { label: string; text: string }) {
    const navigate = useNavigate()
    return (
        <main className="twp flex h-full w-full flex-col items-center justify-center gap-8 bg-slate-100 p-4">
            <img src="/fizz-logo.png" className="w-32 sm:w-64" />
            <div className="h-1 w-4/5 bg-black sm:w-3/5" />
            <h1 className="lilita text-center text-5xl sm:text-7xl">{label}</h1>
            <div className="h-1 w-4/5 bg-black sm:w-3/5" />
            <h2 className="text-center font-gotham text-lg sm:text-2xl">{text}</h2>
            <Button onClick={() => navigate('/')}>
                Go Home
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </main>
    )
}
