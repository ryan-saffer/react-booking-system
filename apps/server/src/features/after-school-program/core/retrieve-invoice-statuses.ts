import type { InvoiceStatusMap, RetrieveInvoiceStatusesParams } from '@fizz-kidz/core'

import { retrieveInvoiceStatus } from './retrieve-invoice-status'

import { DatabaseClient } from '@/integrations/firebase/database.client'

export async function retrieveInvoiceStatuses(input: RetrieveInvoiceStatusesParams) {
    const invoiceStatuses: InvoiceStatusMap = {}

    await Promise.all(
        input.appointmentIds.map(async (appointmentId) => {
            const enrolment = await DatabaseClient.getAfterSchoolEnrolment(appointmentId)
            invoiceStatuses[enrolment.id] = await retrieveInvoiceStatus(enrolment)
        })
    )

    return invoiceStatuses
}
