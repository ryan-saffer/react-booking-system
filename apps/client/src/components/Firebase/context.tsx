import React from 'react'

import type Firebase from './firebase'

export const FirebaseContext = React.createContext<Firebase | undefined>(undefined)
