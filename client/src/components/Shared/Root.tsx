import { Card, Row } from 'antd'
import React from 'react'

import * as Logo from '@drawables/FizzKidzLogoHorizontal.png'

type Props = {
    width?: 'centered' | 'full'
    logoSize?: 'sm' | 'lg'
    children?: React.ReactNode
}

const defaultProps: Partial<Props> = {
    width: 'centered',
    logoSize: 'lg',
}

const Root: React.FC<Props> = (_props) => {
    const props = {
        ...defaultProps,
        ..._props,
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
            }}
        >
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
            <Card
                style={{
                    width: '100%',
                    height: 'fit-content',
                    maxWidth: props.width === 'centered' ? 600 : '100%',
                    borderRadius: 16,
                    boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
                    zIndex: 100,
                    margin: 20,
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                        style={{ maxWidth: props.logoSize === 'lg' ? 200 : 130 }}
                        src={Logo.default}
                        alt="school logo"
                    />
                </div>
                <Row justify="center">{props.children}</Row>
            </Card>
        </div>
    )
}

export default Root
