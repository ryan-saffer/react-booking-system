import { LittleLearnersInvoicesTable } from '../components/little-learners-invoices-table'

export function LittleLearnersInvoiceStatusPage() {
    return (
        <main className="twp flex justify-center bg-slate-100 px-4 py-6 dashboard-full-screen">
            <div className="w-full max-w-6xl">
                <LittleLearnersInvoicesTable />
            </div>
        </main>
    )
}
