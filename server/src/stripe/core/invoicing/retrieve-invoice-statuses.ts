import { InvoiceStatusMap, RetrieveInvoiceStatusesParams, ScienceEnrolment } from 'fizz-kidz'

import { FirestoreClient } from '../../../firebase/FirestoreClient'
import { retrieveInvoiceStatus } from './retrieve-invoice-status'

export async function retrieveInvoiceStatuses(input: RetrieveInvoiceStatusesParams) {
    const invoiceStatuses: InvoiceStatusMap = {}

    const db = await FirestoreClient.getInstance()

    await Promise.all(
        input.appointmentIds.map(async (appointmentId) => {
            const enrolment = (
                await db.collection('scienceAppointments').doc(appointmentId).get()
            ).data() as ScienceEnrolment

            invoiceStatuses[enrolment.id] = await retrieveInvoiceStatus(enrolment)
        })
    )

    return invoiceStatuses
}
