import type { InvoiceStatusMap, RetrieveInvoiceStatusesParams, ScienceEnrolment } from 'fizz-kidz'
import { onCall } from '../../../utilities'
import { retrieveInvoiceStatus } from '../../core/invoicing/retrieveInvoiceStatus'
import { FirestoreClient } from '../../../firebase/FirestoreClient'

export const retrieveInvoiceStatuses = onCall<'retrieveInvoiceStatuses'>(
    async (data: RetrieveInvoiceStatusesParams) => {
        const invoiceStatuses: InvoiceStatusMap = {}

        const db = await FirestoreClient.getInstance()

        await Promise.all(
            data.appointmentIds.map(async (appointmentId) => {
                const enrolment = (
                    await db.collection('scienceAppointments').doc(appointmentId).get()
                ).data() as ScienceEnrolment

                invoiceStatuses[enrolment.id] = await retrieveInvoiceStatus(enrolment)
            })
        )

        return invoiceStatuses
    }
)
