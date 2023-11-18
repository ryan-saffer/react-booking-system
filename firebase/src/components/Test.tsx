import { useState } from 'react'

import { trpc } from '@utils/trpc'

const Test = () => {
    const { data: firstGreetingData, refetch: refetchFirstGreeting } =
        trpc.birthdayParties.firstRouterFunctionOne.useQuery(undefined, {
            enabled: false,
        })
    const secondGreeting = trpc.holidayPrograms.secondRouterFunctionOne.useMutation()

    const [value, setValue] = useState('')

    return (
        <div>
            {firstGreetingData && <p>{firstGreetingData.first}</p>}

            <button onClick={() => refetchFirstGreeting()}>Run first greeting</button>

            {secondGreeting.data && secondGreeting.data.youSentMe}

            <input value={value} onChange={(e) => setValue(e.target.value)} />

            <button onClick={() => secondGreeting.mutate({ ryan: value })}>Run second mutation</button>
        </div>
    )
}

export default Test
