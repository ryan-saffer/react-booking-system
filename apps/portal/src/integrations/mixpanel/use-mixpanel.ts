import { useContext } from 'react'

import { MixpanelContext } from '@integrations/mixpanel/MixpanelContext'

import type { Mixpanel } from 'mixpanel-browser'

const useMixpanel = () => {
    const mixpanel = useContext(MixpanelContext) as Mixpanel
    return mixpanel
}

export default useMixpanel
