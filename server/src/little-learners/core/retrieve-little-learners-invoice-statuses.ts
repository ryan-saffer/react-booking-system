import type { InvoiceStatusMap, RetrieveLittleLearnersInvoiceStatusesParams } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'

import { retrieveLittleLearnersInvoiceStatus } from './retrieve-little-learners-invoice-status'

export async function retrieveLittleLearnersInvoiceStatuses(input: RetrieveLittleLearnersInvoiceStatusesParams) {
    const invoiceStatuses: InvoiceStatusMap = {}

    await Promise.all(
        input.enrolmentIds.map(async (enrolmentId) => {
            const enrolment = await DatabaseClient.getLittleLearnersEnrolment(enrolmentId)
            invoiceStatuses[enrolment.id] = await retrieveLittleLearnersInvoiceStatus(enrolment)
        })
    )

    return invoiceStatuses
}
