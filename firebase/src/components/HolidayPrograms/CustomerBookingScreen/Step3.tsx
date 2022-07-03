import React, { useEffect } from 'react'
import { FormInstance } from 'antd'

type Props = {
    form: FormInstance
}

const Step3: React.FC<Props> = ({ form }) => {

    useEffect(() => {
        console.log(form.getFieldValue('phone'))
    }, [])

    return (
        <div>Step 3!</div>
    )
}

export default Step3