import { AfterSchoolProgramClassSelection } from '../shared/after-school-program-class-selection'

export const AfterSchoolProgramInvoicingPage = () => {
    return (
        <main className="mx-4 flex justify-center">
            <div className="w-full max-w-5xl">
                <h1 className="lilita text-2xl">After School Program Invoicing</h1>
                <AfterSchoolProgramClassSelection classRoute="class" classRequired={false} />
            </div>
        </main>
    )
}
