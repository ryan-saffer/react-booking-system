import {
    CreatePaymentIntentParams,
    RetrieveInvoiceStatusesParams,
    SendInvoiceParams,
    UpdatePaymentIntentParams,
} from 'fizz-kidz'

import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { retrieveInvoiceStatuses } from '../../core/invoicing/retrieve-invoice-statuses'
import { sendInvoices } from '../../core/invoicing/send-invoices'
import { createPaymentIntent } from '../../core/payment-intents/create-payment-intent'
import { updatePaymentIntent } from '../../core/payment-intents/update-payment-intent'

export const stripeRouter = router({
    retrieveInvoiceStatuses: publicProcedure
        .input((input: unknown) => input as RetrieveInvoiceStatusesParams)
        .query(async ({ input }) => retrieveInvoiceStatuses(input)),
    sendInvoices: authenticatedProcedure
        .input((input: unknown) => input as SendInvoiceParams[])
        .mutation(({ input }) => sendInvoices(input)),
    createPaymentIntent: publicProcedure
        .input((input: unknown) => input as CreatePaymentIntentParams)
        .mutation(({ input }) => createPaymentIntent(input)),
    updatePaymentIntent: publicProcedure
        .input((input: unknown) => input as UpdatePaymentIntentParams)
        .mutation(({ input }) => updatePaymentIntent(input)),
})
