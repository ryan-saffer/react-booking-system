import { LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { useAuth } from '@components/Hooks/context/useAuth'
import { Button } from '@ui-components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@ui-components/dropdown-menu'

export function UserButton() {
    const navigate = useNavigate()
    const firebase = useFirebase()
    const user = useAuth()

    const name = `${user?.firstname || ''} ${user?.lastname || ''}`.trim()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="overflow-hidden rounded-full focus:outline-none">
                    <img
                        src={user?.imageUrl || `https://api.dicebear.com/8.x/shapes/svg?seed=${user?.email}`}
                        width={40}
                        height={40}
                        alt="Avatar"
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount className="twp w-60">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        <p className="text-xs leading-none text-muted-foreground">{name || user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={firebase.doSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
