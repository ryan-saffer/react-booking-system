/* eslint-disable react-refresh/only-export-components -- shadcn sidebar exports its companion hook from the component module. */

import { useIsMobile } from '@hooks/use-mobile'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { PanelLeft } from 'lucide-react'
import * as React from 'react'

import { cn } from '@utils/tailwind'

import { Button } from './button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '18rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

type SidebarContextProps = {
    state: 'expanded' | 'collapsed'
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    openMobile: boolean
    setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
    isMobile: boolean
    topOffset: string
    toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
    const context = React.useContext(SidebarContext)

    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider.')
    }

    return context
}

const SidebarProvider = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        defaultOpen?: boolean
        open?: boolean
        onOpenChange?: (open: boolean) => void
        topOffset?: string
    }
>(
    (
        {
            defaultOpen = true,
            open: openProp,
            onOpenChange: setOpenProp,
            topOffset = '0px',
            className,
            style,
            children,
            ...props
        },
        ref
    ) => {
        const isMobile = useIsMobile()
        const [openMobile, setOpenMobile] = React.useState(false)
        const [_open, _setOpen] = React.useState(defaultOpen)
        const open = openProp ?? _open

        const setOpen = React.useCallback<React.Dispatch<React.SetStateAction<boolean>>>(
            (value) => {
                const openState = typeof value === 'function' ? value(open) : value

                if (setOpenProp) {
                    setOpenProp(openState)
                } else {
                    _setOpen(openState)
                }

                document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
            },
            [setOpenProp, open]
        )

        const toggleSidebar = React.useCallback(() => {
            if (isMobile) {
                setOpenMobile((currentOpen) => !currentOpen)
            } else {
                setOpen((currentOpen) => !currentOpen)
            }
        }, [isMobile, setOpen])

        React.useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault()
                    toggleSidebar()
                }
            }

            window.addEventListener('keydown', handleKeyDown)

            return () => window.removeEventListener('keydown', handleKeyDown)
        }, [toggleSidebar])

        const state = open ? 'expanded' : 'collapsed'

        const contextValue = React.useMemo<SidebarContextProps>(
            () => ({
                state,
                open,
                setOpen,
                isMobile,
                openMobile,
                setOpenMobile,
                topOffset,
                toggleSidebar,
            }),
            [state, open, setOpen, isMobile, openMobile, topOffset, toggleSidebar]
        )

        return (
            <SidebarContext.Provider value={contextValue}>
                <TooltipProvider delayDuration={0}>
                    <div
                        style={
                            {
                                '--sidebar-width': SIDEBAR_WIDTH,
                                '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                                '--sidebar-top': topOffset,
                                ...style,
                            } as React.CSSProperties
                        }
                        className={cn('group/sidebar-wrapper flex min-h-svh w-full', className)}
                        ref={ref}
                        {...props}
                    >
                        {children}
                    </div>
                </TooltipProvider>
            </SidebarContext.Provider>
        )
    }
)
SidebarProvider.displayName = 'SidebarProvider'

const Sidebar = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        side?: 'left' | 'right'
        variant?: 'sidebar' | 'floating' | 'inset'
        collapsible?: 'offcanvas' | 'icon' | 'none'
    }
>(({ side = 'left', variant = 'sidebar', collapsible = 'offcanvas', className, children, ...props }, ref) => {
    const { isMobile, state, openMobile, setOpenMobile, topOffset } = useSidebar()

    if (collapsible === 'none') {
        return (
            <div
                className={cn(
                    'twp flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar text-sidebar-foreground',
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </div>
        )
    }

    if (isMobile) {
        return (
            <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
                <SheetContent
                    data-sidebar="sidebar"
                    data-mobile="true"
                    className="twp bottom-auto top-[var(--sidebar-top)] h-[calc(100svh-var(--sidebar-top))] w-[var(--sidebar-width)] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
                    style={
                        {
                            '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
                            '--sidebar-top': topOffset,
                        } as React.CSSProperties
                    }
                    side={side}
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Sidebar</SheetTitle>
                        <SheetDescription>Displays the dashboard navigation.</SheetDescription>
                    </SheetHeader>
                    <div className="flex h-full w-full flex-col">{children}</div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <div
            ref={ref}
            className="group peer hidden w-0 shrink-0 text-sidebar-foreground md:block"
            data-state={state}
            data-collapsible={state === 'collapsed' ? collapsible : ''}
            data-variant={variant}
            data-side={side}
        >
            <div className="relative w-0 bg-transparent" />
            <div
                className={cn(
                    'twp fixed bottom-0 top-[var(--sidebar-top)] z-40 hidden h-[calc(100svh-var(--sidebar-top))] w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex',
                    side === 'left'
                        ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
                        : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
                    variant === 'floating' || variant === 'inset'
                        ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+theme(spacing.4)+2px)]'
                        : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l',
                    className
                )}
                {...props}
            >
                <div
                    data-sidebar="sidebar"
                    className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
                >
                    {children}
                </div>
            </div>
        </div>
    )
})
Sidebar.displayName = 'Sidebar'

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
    ({ className, onClick, ...props }, ref) => {
        const { toggleSidebar } = useSidebar()

        return (
            <Button
                ref={ref}
                data-sidebar="trigger"
                variant="ghost"
                size="icon"
                className={cn('h-7 w-7', className)}
                onClick={(event) => {
                    onClick?.(event)
                    toggleSidebar()
                }}
                {...props}
            >
                <PanelLeft />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
        )
    }
)
SidebarTrigger.displayName = 'SidebarTrigger'

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(
    ({ className, ...props }, ref) => {
        const { toggleSidebar } = useSidebar()

        return (
            <button
                ref={ref}
                data-sidebar="rail"
                aria-label="Toggle Sidebar"
                tabIndex={-1}
                onClick={toggleSidebar}
                title="Toggle Sidebar"
                className={cn(
                    'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex',
                    '[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize',
                    '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
                    'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar',
                    '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
                    '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
                    className
                )}
                {...props}
            />
        )
    }
)
SidebarRail.displayName = 'SidebarRail'

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<'main'>>(({ className, ...props }, ref) => (
    <main ref={ref} className={cn('relative flex min-w-0 flex-1 flex-col bg-background', className)} {...props} />
))
SidebarInset.displayName = 'SidebarInset'

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="header" className={cn('flex flex-col gap-2 p-2', className)} {...props} />
))
SidebarHeader.displayName = 'SidebarHeader'

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="content"
        className={cn(
            'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
            className
        )}
        {...props}
    />
))
SidebarContent.displayName = 'SidebarContent'

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="group"
        className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
        {...props}
    />
))
SidebarGroup.displayName = 'SidebarGroup'

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'> & { asChild?: boolean }>(
    ({ className, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'div'

        return (
            <Comp
                ref={ref}
                data-sidebar="group-label"
                className={cn(
                    'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                    'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
                    className
                )}
                {...props}
            />
        )
    }
)
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} data-sidebar="group-content" className={cn('w-full text-sm', className)} {...props} />
    )
)
SidebarGroupContent.displayName = 'SidebarGroupContent'

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(({ className, ...props }, ref) => (
    <ul ref={ref} data-sidebar="menu" className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />
))
SidebarMenu.displayName = 'SidebarMenu'

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
    <li ref={ref} data-sidebar="menu-item" className={cn('group/menu-item relative', className)} {...props} />
))
SidebarMenuItem.displayName = 'SidebarMenuItem'

const sidebarMenuButtonVariants = cva(
    'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-primary data-[active=true]:font-medium data-[active=true]:text-sidebar-primary-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                outline:
                    'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
            },
            size: {
                default: 'h-8 text-sm',
                sm: 'h-7 text-xs',
                lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

const SidebarMenuButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & {
        asChild?: boolean
        isActive?: boolean
        tooltip?: string | React.ComponentProps<typeof TooltipContent>
    } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive = false, variant = 'default', size = 'default', tooltip, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const { isMobile, state } = useSidebar()

    const button = (
        <Comp
            ref={ref}
            data-sidebar="menu-button"
            data-size={size}
            data-active={isActive}
            className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
            {...props}
        />
    )

    if (!tooltip) {
        return button
    }

    const tooltipProps = typeof tooltip === 'string' ? { children: tooltip } : tooltip

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right" align="center" hidden={state !== 'collapsed' || isMobile} {...tooltipProps} />
        </Tooltip>
    )
})
SidebarMenuButton.displayName = 'SidebarMenuButton'

export {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
    useSidebar,
}
