import { ArrowRight, ChevronsUpDown, Settings } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { useOrg } from '@components/Session/use-org'
import { getRoleDisplayValue } from '@constants/roles'
import { Button } from '@ui-components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { getOrgName } from '@utils/studioUtils'
import { cn } from '@utils/tailwind'

export function OrganisationSwitcher() {
    const navigate = useNavigate()

    const [open, setOpen] = useState(false)
    const { availableOrgs, currentOrg, switchToOrg, role } = useOrg()

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="secondary"
                    className={cn('h-10 min-w-44 justify-between', { 'text-slate-500': !currentOrg })}
                >
                    {currentOrg ? getOrgName(currentOrg) : 'No Studio Selected'}
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="twp w-64 p-0" align="end" forceMount>
                {currentOrg && role && (
                    <div className="flex w-full items-center justify-between p-4">
                        <div className="text-sm font-semibold">
                            {getOrgName(currentOrg)}
                            <p className="text-xs text-gray-500">{getRoleDisplayValue(role)}</p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                navigate('/dashboard/settings/members')
                                setOpen(false)
                            }}
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                {availableOrgs?.length &&
                    availableOrgs.length > 0 &&
                    availableOrgs
                        .filter((it) => it !== currentOrg)
                        .map((org) => (
                            <div
                                key={org}
                                className="group flex cursor-pointer items-center justify-between border-t p-4 text-sm font-light hover:bg-slate-100"
                                onClick={() => {
                                    switchToOrg(org)
                                    setOpen(false)
                                }}
                            >
                                {getOrgName(org)}
                                <div className="invisible flex h-2 w-12 items-center justify-center group-hover:visible">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        ))}
                {(availableOrgs === null || availableOrgs.length === 0) && (
                    <p className="p-4 text-sm">You have not been added to any studios.</p>
                )}
            </PopoverContent>
        </Popover>
    )
}
