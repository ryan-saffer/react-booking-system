import type { InvoiceStatusMap, RetrievePreschoolProgramInvoiceStatusesParams } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'

import { retrievePreschoolProgramInvoiceStatus } from './retrieve-preschool-program-invoice-status'

export async function retrievePreschoolProgramInvoiceStatuses(input: RetrievePreschoolProgramInvoiceStatusesParams) {
    const invoiceStatuses: InvoiceStatusMap = {}

    await Promise.all(
        input.enrolmentIds.map(async (enrolmentId) => {
            const enrolment = await DatabaseClient.getPreschoolProgramEnrolment(enrolmentId)
            invoiceStatuses[enrolment.id] = await retrievePreschoolProgramInvoiceStatus(enrolment)
        })
    )

    return invoiceStatuses
}
