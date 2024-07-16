import { ArrowRight, RotateCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@ui-components/button'

export function ErrorScreen({ label, text, showRefresh = false }: { label: string; text: string, showRefresh?: boolean }) {
    const navigate = useNavigate()
    return (
        <main className="twp flex h-full w-full flex-col items-center justify-center gap-8 bg-slate-100 p-4">
            <img src="/fizz-logo.png" className="w-32 sm:w-64" />
            <div className="h-1 w-4/5 bg-black sm:w-3/5" />
            <h1 className="lilita text-center text-5xl sm:text-7xl">{label}</h1>
            <div className="h-1 w-4/5 bg-black sm:w-3/5" />
            <h2 className="text-center font-gotham text-lg sm:text-2xl">{text}</h2>
            {showRefresh && <Button onClick={() => location.reload()} className="bg-[#B14594] hover:bg-fuchsia-800">
                Refresh
                <RotateCw className="ml-2 h-4 w-4" />
            </Button>}
            <Button onClick={() => navigate('/')} className="bg-[#B14594] hover:bg-fuchsia-800">
                Go Home
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </main>
    )
}
