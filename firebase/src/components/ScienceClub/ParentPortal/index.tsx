import Root from '../../Shared/Root'
import ParentPortalMain from './ParentPortal'

export const ParentPortalRoot = () => {
    return (
        <Root color="green" width="full" logoSize="sm">
            <div style={{ width: '100%', minHeight: '80vh' }}>
                <ParentPortalMain />
            </div>
        </Root>
    )
}
