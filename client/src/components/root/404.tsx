import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@ui-components/button'

export function _404() {
    const navigate = useNavigate()
    return (
        <main className="twp flex h-full w-full flex-col items-center justify-center gap-8 bg-slate-100">
            <img src="/fizz-logo.png" className="w-64" />
            <div className="h-1 w-2/5 bg-black" />
            <h1 className="lilita text-9xl ">404</h1>
            <div className="h-1 w-2/5 bg-black" />
            <h2 className="font-gotham text-2xl">Sorry, we couldn't find what you were looking for!</h2>
            <Button onClick={() => navigate('/')} className="bg-[#B14594] hover:bg-fuchsia-800">
                Go Home
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </main>
    )
}
