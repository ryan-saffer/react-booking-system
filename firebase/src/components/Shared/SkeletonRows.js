import React from 'react'
import { Skeleton } from '@mui/material'

const SkeletonRows = (props) => {
    const rowCount = Math.floor(props.rowCount)

    return (
        <>
            {[...Array(rowCount)].map((_, i) => (
                <Skeleton
                    style={{ margin: '0px 24px 0px 24px' }}
                    key={i}
                    animation={i % 2 === 0 ? 'pulse' : 'wave'}
                    height={64}
                />
            ))}
        </>
    )
}

export default SkeletonRows
