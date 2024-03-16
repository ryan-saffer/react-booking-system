import { Link, Outlet } from 'react-router-dom'

export function DashboardLayout() {
    return (
        <>
            <nav id="navbar" className="twp z-50 flex h-16 w-full items-center justify-center bg-slate-900 shadow-md">
                <Link to="/dashboard" preventScrollReset={true}>
                    <img src="/fizz-logo.png" className="h-12" />
                </Link>
            </nav>
            <Outlet />
        </>
    )
}
