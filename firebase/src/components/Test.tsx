import { useState } from 'react'

import { trpc } from '@utils/trpc'

const Test = () => {
    const {
        data: partiesData,
        refetch: refetchParties,
        isLoading: isLoadingParties,
    } = trpc.parties.getParties.useQuery()

    const {
        mutate: bookHolidayProgram,
        data: bookHolidayProgramResult,
        isError: isHolidayProgramError,
        error: holidayProgramError,
    } = trpc.holidayPrograms.bookHolidayProgram.useMutation()

    const [value, setValue] = useState('')

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ width: '25%' }}>
                <h3>Parties:</h3>
                {isLoadingParties && <p>Loading Parties...</p>}
                {partiesData && (
                    <ul>
                        {partiesData.parties.map((party, idx) => (
                            <li key={idx}>{party}</li>
                        ))}
                    </ul>
                )}

                <button onClick={() => refetchParties()}>Fetch Parties</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', width: '25%' }}>
                <h3>Holiday Programs</h3>
                {bookHolidayProgramResult && <p>{bookHolidayProgramResult.bookingId}</p>}
                {isHolidayProgramError && <h4>Error: {holidayProgramError.message}</h4>}

                <label htmlFor="data">Data:</label>
                <input
                    id="data"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <button onClick={() => bookHolidayProgram({ time: value })}>Book holiday program</button>
            </div>
        </div>
    )
}

export default Test
