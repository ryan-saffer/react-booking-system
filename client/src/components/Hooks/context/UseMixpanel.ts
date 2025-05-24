import type { Mixpanel } from 'mixpanel-browser'
import { useContext } from 'react'

import { MixpanelContext } from '@components/Mixpanel/MixpanelContext'

const useMixpanel = () => {
    const mixpanel = useContext(MixpanelContext) as Mixpanel
    return mixpanel
}

export default useMixpanel
