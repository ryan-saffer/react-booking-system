import { AfterSchoolProgramClassSelection } from '../shared/after-school-program-class-selection'

export const SelectClassPage = () => {
    return (
        <main className="dashboard-full-screen flex justify-center bg-slate-100 px-4">
            <div className="w-full max-w-5xl">
                <h1 className="lilita text-2xl">After School Program</h1>
                <AfterSchoolProgramClassSelection classRoute="class" classRequired={true} />
            </div>
        </main>
    )
}
