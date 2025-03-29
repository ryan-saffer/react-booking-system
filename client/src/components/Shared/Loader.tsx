import React from 'react'

import { cn } from '@utils/tailwind'

type Props = {
    className?: string
    style?: React.CSSProperties
    size?: 'sm' | 'lg'
    fullScreen?: boolean
}

const defaultProps: Props = {
    size: 'lg',
    fullScreen: false,
}

const Loader: React.FC<Props> = (_props) => {
    const props = {
        ...defaultProps,
        ..._props,
    }

    const { className, style, size, fullScreen } = props

    return (
        <div
            className={cn(className, { 'dashboard-full-screen': fullScreen })}
            style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', ...style }}
        >
            <img src={'/loader.gif'} width={size === 'sm' ? 100 : 150} className="object-contain" />
            {/* <Loader2 className={cn('animate-spin text-primary', size === 'sm' ? 'h-8 w-8' : 'h-10 w-10')} /> */}
        </div>
    )
}

export default Loader
