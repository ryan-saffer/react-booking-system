import { useState } from 'react'

const useForceRerenderComponent = () => {
    const [value, setValue] = useState(true)
    return () => setValue(!value)
}

export default useForceRerenderComponent
