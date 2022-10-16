import { Mixpanel } from './../../../../node_modules/@types/mixpanel-browser/index.d'
import { useContext } from 'react'
import { MixpanelContext } from '../../Mixpanel/MixpanelContext'

const useMixpanel = () => {
    const mixpanel = useContext(MixpanelContext) as Mixpanel
    return mixpanel
}

export default useMixpanel
