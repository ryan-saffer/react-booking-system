import { parties as partiesRouter, holidayPrograms as holidayProgramsRouter, onRequestTrpc } from './trpc'

export const parties = onRequestTrpc(partiesRouter)
export const holidayPrograms = onRequestTrpc(holidayProgramsRouter)
