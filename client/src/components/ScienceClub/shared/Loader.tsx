import { Spin } from 'antd'
import React from 'react'

import { LoadingOutlined } from '@ant-design/icons'

type Props = {
    className?: string
    style?: React.CSSProperties
    size?: 'sm' | 'lg'
}

const defaultProps: Props = {
    size: 'lg',
}

const Loader: React.FC<Props> = (_props) => {
    const props = {
        ...defaultProps,
        ..._props,
    }

    const { className, style, size } = props

    const antIcon = <LoadingOutlined style={{ fontSize: size === 'sm' ? 24 : 48 }} spin />
    return (
        <div
            className={className}
            style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', ...style }}
        >
            <Spin indicator={antIcon} />
        </div>
    )
}

export default Loader
