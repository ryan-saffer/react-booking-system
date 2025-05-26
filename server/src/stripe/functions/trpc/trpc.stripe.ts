import type { RetrieveInvoiceStatusesParams, SendInvoiceParams } from 'fizz-kidz'

import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { retrieveInvoiceStatuses } from '../../core/invoicing/retrieve-invoice-statuses'
import { sendInvoices } from '../../core/invoicing/send-invoices'

export const stripeRouter = router({
    retrieveInvoiceStatuses: publicProcedure
        .input((input) => input as RetrieveInvoiceStatusesParams)
        .query(async ({ input }) => retrieveInvoiceStatuses(input)),
    sendInvoices: authenticatedProcedure
        .input((input) => input as SendInvoiceParams[])
        .mutation(({ input }) => sendInvoices(input)),
})

export const stripe = onRequestTrpc(stripeRouter)
