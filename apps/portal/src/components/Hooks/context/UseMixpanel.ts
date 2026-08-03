import { useContext } from 'react'

import { MixpanelContext } from '@components/Mixpanel/MixpanelContext'

import type { Mixpanel } from 'mixpanel-browser'

const useMixpanel = () => {
    const mixpanel = useContext(MixpanelContext) as Mixpanel
    return mixpanel
}

export default useMixpanel
