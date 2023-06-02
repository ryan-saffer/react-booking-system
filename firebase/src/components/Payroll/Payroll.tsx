import React, { useState } from 'react'
import { Alert, Button, DatePicker } from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'
import { callFirebaseFunction } from '../../utilities/firebase/functions'
import useFirebase from '../Hooks/context/UseFirebase'
import { GenerateTimesheetsResponse, Service } from 'fizz-kidz'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'

const { RangePicker } = DatePicker

dayjs.extend(updateLocale)
dayjs.updateLocale('en', { weekStart: 1 })

type Props = {}

export const Payroll: React.FC<Props> = ({}) => {
    const firebase = useFirebase()

    const [selectedDates, setSelectedDates] = useState<[string, string]>(['', ''])
    const [result, setResult] = useState<Service<GenerateTimesheetsResponse>>({ status: 'init' })

    const onChange: RangePickerProps['onChange'] = async (value, format) => {
        console.log(format)
        setSelectedDates(format)
    }

    const generateTimesheets = async () => {
        setResult({ status: 'loading' })

        try {
            const result = await callFirebaseFunction(
                'generateTimesheets',
                firebase
            )({ startDateInput: selectedDates[0], endDateInput: selectedDates[1] })
            setResult({ status: 'loaded', result: result.data })
        } catch (error) {
            console.error(error)
            setResult({ status: 'error', error })
        }
    }

    const renderError = (error: any) => {
        let message = 'Error'
        let description = 'Something went wrong generating the timesheet'

        if (error.errorCode === 'invalid-length') {
            message = 'Invalid range'
            description = 'The date range must be 28 days or less'
        }
        return <Alert message={message} description={description} type="error" showIcon closable />
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <RangePicker onChange={onChange} />
            <Button
                type="primary"
                loading={result.status === 'loading'}
                onClick={generateTimesheets}
                disabled={selectedDates[0] === '' || selectedDates[1] === ''}
            >
                Generate Timesheets
            </Button>
            {result.status === 'error' && renderError(result.error.details)}
            {result.status === 'loaded' && (
                <div>
                    <Button onClick={() => window.open(result.result.url, '_blank')}>Download Timesheets</Button>
                    <p>
                        The following employees timesheets were not generated because they could not be found in xero:
                    </p>
                    {result.result.skippedEmployees.map((employee) => (
                        <p>{employee}</p>
                    ))}
                </div>
            )}
        </div>
    )
}
