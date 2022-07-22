
export type AcuityWebhookData = {
    action: 'scheduled' | 'rescheduled' | 'canceled' | 'changed' | "order.completed",
    id: string,
    calendarID: string,
    appointmentTypeID: string
}