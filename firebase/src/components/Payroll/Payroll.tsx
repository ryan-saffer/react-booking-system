import React, { useState } from 'react'
import { Button, DatePicker } from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'
import { callFirebaseFunction } from '../../utilities/firebase/functions'
import useFirebase from '../Hooks/context/UseFirebase'

const { RangePicker } = DatePicker

type Props = {}

export const Payroll: React.FC<Props> = ({}) => {
    const firebase = useFirebase()

    const [loading, setLoading] = useState(false)
    const [selectedDates, setSelectedDates] = useState<[string, string]>(['', ''])

    const onChange: RangePickerProps['onChange'] = async (value, format) => {
        console.log(format)
        setSelectedDates(format)
    }

    const generateTimesheets = async () => {
        setLoading(true)

        try {
            const result = await callFirebaseFunction(
                'generateTimesheets',
                firebase
            )({ startDateInput: selectedDates[0], endDateInput: selectedDates[1] })
            window.open(result.data.url, '_blank')
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <RangePicker onChange={onChange} />
            <Button type="primary" loading={loading} onClick={generateTimesheets}>
                Generate Timesheets
            </Button>
        </>
    )
}
