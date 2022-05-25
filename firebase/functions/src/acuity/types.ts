
export type AcuityWebhookData = {
    action: 'scheduled' | 'rescheduled' | 'cancelled' | 'changed' | "order.completed",
    id: string,
    calendarID: string,
    appointmentTypeID: string
}