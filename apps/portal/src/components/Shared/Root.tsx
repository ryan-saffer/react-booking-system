import React from 'react'

import * as LogoImg from '@drawables/FizzKidzLogoHorizontal.png'
import { Card, CardContent } from '@ui-components/card'
import { cn } from '@utils/tailwind'

type Props = {
    width?: 'centered' | 'full'
    logoSize?: 'sm' | 'lg'
    useTailwindPreflight?: boolean
    logoHref?: string
    children?: React.ReactNode
}

const defaultProps: Partial<Props> = {
    width: 'centered',
    logoSize: 'lg',
    useTailwindPreflight: true,
}

const Root: React.FC<Props> = (_props) => {
    const props = {
        ...defaultProps,
        ..._props,
    }

    return (
        <div className={cn(' flex min-h-[100vh] justify-center', { twp: props.useTailwindPreflight })}>
            <img
                src="/backgrounds/bg-fizz-top-left.png"
                className="fixed left-0 top-0 z-0 w-full max-w-[400px] object-contain"
            />
            <img
                src="/backgrounds/bg-fizz-top-right.png"
                className="fixed right-0 top-0 z-0 w-full max-w-[min(100vw,400px)] object-contain"
            />
            <img
                src="/backgrounds/bg-fizz-bottom-left.png"
                className="fixed bottom-0 left-0 z-0 w-full max-w-[400px] object-contain"
            />
            <img
                src="/backgrounds/bg-fizz-bottom-right.png"
                className="fixed bottom-0 right-0 z-0 w-full max-w-[400px] object-contain"
            />
            <Card className={cn('z-50 m-5 h-fit w-[600px] shadow-md', { 'w-full': props.width === 'full' })}>
                <CardContent className="flex flex-col items-center">
                    <div className="my-4 flex flex-col items-center">
                        {props.logoHref ? (
                            <a href={props.logoHref} target="_blank">
                                <Logo logoSize={props.logoSize} />
                            </a>
                        ) : (
                            <Logo logoSize={props.logoSize} />
                        )}
                    </div>
                    {props.children}
                </CardContent>
            </Card>
        </div>
    )
}

function Logo({ logoSize }: { logoSize: Props['logoSize'] }) {
    return <img style={{ maxWidth: logoSize === 'lg' ? 200 : 130 }} src={LogoImg.default} alt="Fizz Kidz Logo" />
}

export default Root
