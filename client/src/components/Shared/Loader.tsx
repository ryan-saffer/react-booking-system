import { Loader2 } from 'lucide-react'
import React from 'react'

import { cn } from '@utils/tailwind'

type Props = {
    className?: string
    style?: React.CSSProperties
    size?: 'sm' | 'lg'
    color?: string
}

const defaultProps: Props = {
    size: 'lg',
    color: 'black',
}

const Loader: React.FC<Props> = (_props) => {
    const props = {
        ...defaultProps,
        ..._props,
    }

    const { className, style, size, color } = props

    return (
        <div
            className={className}
            style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', ...style }}
        >
            <Loader2 className={cn(`animate-spin text-[${color}]`, size === 'sm' ? 'h-8 w-8' : 'h-10 w-10')} />
        </div>
    )
}

export default Loader
