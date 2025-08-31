import type { Mixpanel } from 'mixpanel-browser'
import { createContext } from 'react'

export const MixpanelContext = createContext<Mixpanel | undefined>(undefined)
