import { capitalise } from 'fizz-kidz'
import { ArrowRight, ChevronsUpDown, Settings } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { LocationOrMaster } from '@components/Session/org-provider'
import { useOrg } from '@components/Session/use-org'
import { Button } from '@ui-components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'

export function OrganisationSwitcher() {
    const navigate = useNavigate()

    const [open, setOpen] = useState(false)
    const { availableOrgs, selectedOrg, switchToOrg, role } = useOrg()

    const getOrgName = (org: LocationOrMaster | null) => {
        if (!org) return
        if (org === 'master') {
            return 'Master Business'
        } else {
            return `${capitalise(org)} Studio`
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="secondary" className="h-10 w-44">
                    {getOrgName(selectedOrg) || 'No Studio Selected'}
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="twp w-64 p-0" align="end" forceMount>
                {selectedOrg && role && (
                    <div className="flex w-full justify-between border-b p-4">
                        <div className="text-sm font-semibold">
                            {getOrgName(selectedOrg)}
                            <p className="text-xs text-gray-500">{capitalise(role)}</p>
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
                {availableOrgs
                    ?.filter((it) => it !== selectedOrg)
                    .map((org) => (
                        <div
                            key={org}
                            className="group flex cursor-pointer items-center justify-between p-4 text-sm font-light hover:bg-slate-100"
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
            </PopoverContent>
        </Popover>
    )
}
