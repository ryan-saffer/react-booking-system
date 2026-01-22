import { green, red } from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import { Loader2, MoreHorizontal, Pencil, Save, Trash } from 'lucide-react'
import React from 'react'

import { useOrg } from '@components/Session/use-org'
import { Button } from '@ui-components/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui-components/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui-components/tooltip'

const PREFIX = 'EditFormButtons'

const classes = {
    saveButtonDiv: `${PREFIX}-saveButtonDiv`,
    saveButton: `${PREFIX}-saveButton`,
    deleteButton: `${PREFIX}-deleteButton`,
    progress: `${PREFIX}-progress`,
    success: `${PREFIX}-success`,
    editButton: `${PREFIX}-editButton`,
    cancelButton: `${PREFIX}-cancelButton`,
}

const Root = styled('div')(({ theme }) => ({
    [`&.${classes.saveButtonDiv}`]: {
        display: 'flex',
        justifyContent: 'flex-end',
    },

    [`& .${classes.saveButton}`]: {
        marginTop: theme.spacing(3),
    },

    [`& .${classes.deleteButton}`]: {
        marginTop: theme.spacing(3),
        marginRight: theme.spacing(3),
        '&:hover': {
            backgroundColor: red[800],
        },
    },

    [`& .${classes.progress}`]: {
        color: green[500],
        position: 'absolute',
        marginTop: '18px',
        marginRight: '-6px',
    },

    [`& .${classes.success}`]: {
        marginTop: theme.spacing(3),
        backgroundColor: green[500],
    },

    [`& .${classes.editButton}`]: {
        marginTop: theme.spacing(3),
    },

    [`& .${classes.cancelButton}`]: {
        marginTop: theme.spacing(3),
        marginRight: theme.spacing(3),
    },
}))

type Props = {
    loading: boolean
    editing: boolean
    onStartEditing: () => void
    onCancelEditing: () => void
    onSave: () => void
    onDelete: () => void
    menu?: { label: string; action: () => void }[]
}

const EditFormButtons: React.FC<Props> = ({
    loading,
    editing,
    onStartEditing,
    onCancelEditing,
    onSave,
    onDelete,
    menu,
}) => {
    const { hasPermission } = useOrg()
    const canEdit = hasPermission('bookings:edit')

    if (!canEdit) return

    const renderButtons = () => {
        if (loading) {
            return (
                <div className="flex h-12 items-center">
                    <Loader2 className="mr-2 animate-spin" />
                </div>
            )
        }

        if (editing) {
            return (
                <>
                    <Button variant="outline" onClick={onCancelEditing}>
                        Cancel
                    </Button>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-12 w-12 p-0"
                                disabled={loading}
                                type="submit"
                                onClick={onSave}
                            >
                                <Save className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-primary">
                            <p className="text-primary-foreground">Save</p>
                        </TooltipContent>
                    </Tooltip>
                </>
            )
        } else {
            return (
                <>
                    {menu?.length && menu.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-12 w-12 p-0">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {menu.map((item) => (
                                    <DropdownMenuItem key={item.label} onClick={item.action}>
                                        {item.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className="h-12 w-12 p-0" onClick={onDelete}>
                                <Trash className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-primary">
                            <p className="text-primary-foreground">Delete</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-12 w-12 p-0"
                                type="submit"
                                disabled={loading}
                                onClick={onStartEditing}
                            >
                                <Pencil className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-primary">
                            <p className="text-primary-foreground">Edit</p>
                        </TooltipContent>
                    </Tooltip>
                </>
            )
        }
    }

    return (
        <TooltipProvider delayDuration={0}>
            <Root className="twp mt-4 flex items-center justify-end gap-2">{renderButtons()}</Root>
        </TooltipProvider>
    )
}

export default EditFormButtons
