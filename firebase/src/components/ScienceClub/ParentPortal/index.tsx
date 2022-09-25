import React from 'react'
import Root from '../../Shared/Root'
import ParentPortalMain from './ParentPortal'

const ParentPortalRoot = () => {
    return (
        <Root color="green" width="full" logoSize="sm">
            <div style={{ minHeight: '80vh', width: '100%' }}>
                <ParentPortalMain />
            </div>
        </Root>
    )
}

export default ParentPortalRoot
