import { PreschoolProgramInvoicesTable } from '../components/preschool-program-invoices-table'

export function PreschoolProgramInvoiceStatusPage() {
    return (
        <main className="twp flex justify-center bg-slate-100 px-4 py-6 dashboard-full-screen">
            <div className="w-full max-w-6xl">
                <PreschoolProgramInvoicesTable />
            </div>
        </main>
    )
}
