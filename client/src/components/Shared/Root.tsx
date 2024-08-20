import React from 'react'

import * as Logo from '@drawables/FizzKidzLogoHorizontal.png'
import { Card, CardContent } from '@ui-components/card'
import { cn } from '@utils/tailwind'

type Props = {
    width?: 'centered' | 'full'
    logoSize?: 'sm' | 'lg'
    useTailwindPreflight?: boolean,
    children?: React.ReactNode
}

const defaultProps: Partial<Props> = {
    width: 'centered',
    logoSize: 'lg',
    useTailwindPreflight: true
}

const Root: React.FC<Props> = (_props) => {
    const props = {
        ...defaultProps,
        ..._props,
    }

    return (
        <div className={cn(" flex min-h-[100vh] justify-center", { "twp": props.useTailwindPreflight })}>
            <img
                src="/backgrounds/bg-fizz-top-left.png"
                className="absolute left-0 top-0 z-0 w-full max-w-[400px] object-contain"
            />
            <img
                src="/backgrounds/bg-fizz-top-right.png"
                className="absolute right-0 top-0 z-0 w-full max-w-[min(100vw,400px)] object-contain"
            />
            <img
                src="/backgrounds/bg-fizz-bottom-left.png"
                className="absolute bottom-0 left-0 z-0 w-full max-w-[400px] object-contain"
            />
            <img
                src="/backgrounds/bg-fizz-bottom-right.png"
                className="absolute bottom-0 right-0 z-0 w-full max-w-[400px] object-contain"
            />
            <Card className={cn('z-50 m-5 h-fit w-[600px] shadow-md', { 'w-full': props.width === 'full' })}>
                <CardContent className="flex flex-col items-center">
                    <div className="my-4 flex flex-col items-center">
                        <img
                            style={{ maxWidth: props.logoSize === 'lg' ? 200 : 130 }}
                            src={Logo.default}
                            alt="Fizz Kidz Logo"
                        />
                    </div>
                    {props.children}
                </CardContent>
            </Card>
        </div>
    )
}

export default Root
