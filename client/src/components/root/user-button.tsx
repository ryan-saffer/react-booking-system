import { ChevronsUpDown, LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@components/Hooks/context/useAuth'
import useFirebase from '@components/Hooks/context/UseFirebase'
import { Button } from '@ui-components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@ui-components/dropdown-menu'

type UserButtonProps = {
    variant?: 'avatar' | 'sidebar'
    onAction?: () => void
}

export function UserButton({ variant = 'avatar', onAction }: UserButtonProps) {
    const navigate = useNavigate()
    const firebase = useFirebase()
    const user = useAuth()

    const name = `${user?.firstname || ''} ${user?.lastname || ''}`.trim()
    const avatarSrc = user?.imageUrl || `https://api.dicebear.com/8.x/shapes/svg?seed=${user?.email}`

    const openSettings = () => {
        navigate('/dashboard/settings')
        onAction?.()
    }

    const signOut = () => {
        onAction?.()
        firebase.doSignOut()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {variant === 'sidebar' ? (
                    <Button
                        variant="ghost"
                        className="h-auto w-full justify-start gap-3 rounded-xl p-2 text-left hover:bg-sidebar-accent"
                    >
                        <img src={avatarSrc} width={36} height={36} alt="Avatar" className="rounded-lg" />
                        <span className="flex min-w-0 flex-1 flex-col leading-tight">
                            <span className="truncate text-sm font-semibold text-slate-900">
                                {name || 'My Account'}
                            </span>
                            <span className="truncate text-xs font-medium text-slate-500">{user?.email}</span>
                        </span>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-500" />
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon" className="overflow-hidden rounded-full focus:outline-none">
                        <img src={avatarSrc} width={40} height={40} alt="Avatar" />
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                side={variant === 'sidebar' ? 'right' : 'bottom'}
                forceMount
                className="twp w-60"
            >
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        <p className="text-xs leading-none text-muted-foreground">{name || user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
