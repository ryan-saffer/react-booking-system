import * as functions from 'firebase-functions'
import { InvoiceStatusMap, RetrieveInvoiceStatusesParams, ScienceEnrolment } from 'fizz-kidz'
import { onCall } from '../../../utilities'
import { db } from '../../../init'
import { retrieveInvoiceStatus } from '../../core/invoicing/retrieveInvoiceStatus'

export const retrieveInvoiceStatuses = onCall<'retrieveInvoiceStatuses'>(
    async (data: RetrieveInvoiceStatusesParams, _context: functions.https.CallableContext) => {
        const invoiceStatuses: InvoiceStatusMap = {}

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
