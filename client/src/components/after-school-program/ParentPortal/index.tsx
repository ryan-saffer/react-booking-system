import Root from '@components/Shared/Root'

import ParentPortalMain from './ParentPortal'

export const ParentPortalRoot = () => {
    return (
        <Root width="full" logoSize="sm" useTailwindPreflight={false}>
            <div style={{ width: '100%', minHeight: '80vh' }}>
                <ParentPortalMain />
            </div>
        </Root>
    )
}
