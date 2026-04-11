import type { InvoiceStatus } from 'fizz-kidz'

import { Badge } from '@ui-components/badge'

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus | undefined }) {
    if (!status) return <Badge variant="outline">Loading</Badge>

    switch (status.status) {
        case 'NOT_SENT':
            return <Badge variant="secondary">Not Sent</Badge>
        case 'UNPAID':
            return <Badge variant="destructive">Unpaid</Badge>
        case 'PAID':
            return <Badge className="bg-green-600 hover:bg-green-600">Paid</Badge>
        case 'VOID':
            return <Badge variant="outline">Void</Badge>
        case 'UNSUPPORTED':
            return <Badge variant="outline">Unsupported</Badge>
    }
}
