import { createContext } from 'react'

import type { Mixpanel } from 'mixpanel-browser'

export const MixpanelContext = createContext<Mixpanel | undefined>(undefined)
