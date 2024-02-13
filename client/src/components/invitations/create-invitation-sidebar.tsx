import { Form, Input } from 'antd'
import Button from 'antd/es/button'
import { ElementRef, useEffect, useRef, useState } from 'react'

import MenuIcon from '@mui/icons-material/Menu'
import { IconButton, useMediaQuery } from '@mui/material'
import { cn } from '@utils/tailwind'

export const CreateInvitationSidebar = () => {
    const isMobile = useMediaQuery('(max-width: 630px)')
    const sidebarRef = useRef<ElementRef<'aside'>>(null)

    const [isResetting, setIsResetting] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(isMobile)

    const [form] = Form.useForm()

    useEffect(() => {
        if (isMobile) {
            collapse()
        } else {
            resetWidth()
        }
    }, [isMobile])

    const resetWidth = () => {
        if (sidebarRef.current) {
            setIsCollapsed(false)
            setIsResetting(true)

            sidebarRef.current.style.width = isMobile ? '100%' : '240px'
            setTimeout(() => setIsResetting(false), 300)
        }
    }

    const collapse = () => {
        if (sidebarRef.current) {
            setIsCollapsed(true)
            setIsResetting(true)

            sidebarRef.current.style.width = '0'
            setTimeout(() => setIsResetting(false), 300)
        }
    }

    const submit = () => {
        try {
            form.validateFields()
        } catch {
            return
        }
    }

    return (
        <>
            {isMobile && (
                <IconButton className="fixed right-8 top-3" onClick={() => (isCollapsed ? resetWidth() : collapse())}>
                    <MenuIcon className="text-black" />
                </IconButton>
            )}
            <aside
                ref={sidebarRef}
                className={cn(
                    'fixed right-0 top-[62px] z-[999] h-screen w-[240px] border-0 border-t-2 border-slate-300 bg-white text-center',
                    isResetting && 'transition-all duration-300 ease-in-out',
                    isMobile && 'w-0',
                    !isMobile && 'shadow-xl'
                )}
            >
                <div className="mt-2 p-2">
                    <h1 className="font-lilita text-xl">Customise your invitation and send to your kids' friends!</h1>
                    <Form form={form} layout="vertical" size="middle" className="mt-3">
                        <Form.Item
                            name="childName"
                            label="Birthday Child's Name"
                            rules={[{ required: true, message: 'Please enter the birthday childs name' }]}
                            style={{ display: 'inline-block' }}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="date"
                            label="Date"
                            rules={[{ required: true, message: 'Please enter the date of the party' }]}
                            style={{ display: 'inline-block' }}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="time"
                            label="Time"
                            rules={[{ required: true, message: 'Please enter the time of the party' }]}
                            style={{ display: 'inline-block' }}
                        >
                            <Input />
                        </Form.Item>
                        <Button size="large" block onClick={submit}>
                            Generate Invite
                        </Button>
                    </Form>
                </div>
            </aside>
        </>
    )
}
