import { onRequest } from 'firebase-functions/v2/https'

import { createHTTPHandler } from '@trpc/server/adapters/standalone'

import { birthdayParties as birthdayPartiesRouter, holidayPrograms as holidayProgramsRouter } from './trpc'

export const birthdayParties = onRequest(
    createHTTPHandler({
        router: birthdayPartiesRouter,
        createContext: () => {
            return { basePath: 'firstFunction' }
        },
    })
)
export const holidayPrograms = onRequest(
    createHTTPHandler({
        router: holidayProgramsRouter,
        createContext: () => {
            return { basePath: 'secondGreeting' }
        },
    })
)

// export const firstTe = onRequest((req, res) => {
//     console.log('running test function')
//     console.log(req.body)
//     res.sendStatus(200)
// })
