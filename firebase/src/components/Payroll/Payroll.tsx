import React, { useState } from 'react'
import { Alert, Button, DatePicker, Typography, Layout, theme, Divider, Card, Result } from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'
import { callFirebaseFunction } from '../../utilities/firebase/functions'
import useFirebase from '../Hooks/context/UseFirebase'
import { GenerateTimesheetsResponse, Service } from 'fizz-kidz'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'
import { useNavigate } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import { DownloadOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker
const { Title, Paragraph, Text, Link } = Typography
const { Header, Content } = Layout

dayjs.extend(updateLocale)
dayjs.updateLocale('en', { weekStart: 1 })

type Props = {}

export const Payroll: React.FC<Props> = ({}) => {
    const firebase = useFirebase()

    const {
        token: { colorBgContainer },
    } = theme.useToken()

    const navigate = useNavigate()

    const [selectedDates, setSelectedDates] = useState<[string, string]>(['', ''])
    const [timesheetsService, setTimesheetsService] = useState<Service<GenerateTimesheetsResponse>>({ status: 'init' })

    const onChange: RangePickerProps['onChange'] = async (value, format) => {
        console.log(format)
        setSelectedDates(format)
    }

    const generateTimesheets = async () => {
        setTimesheetsService({ status: 'loading' })

        try {
            const result = await callFirebaseFunction(
                'generateTimesheets',
                firebase
            )({ startDateInput: selectedDates[0], endDateInput: selectedDates[1] })
            setTimesheetsService({ status: 'loaded', result: result.data })
        } catch (error) {
            console.error(error)
            setTimesheetsService({ status: 'error', error })
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
        <Layout style={{ background: 'rgb(240, 242, 245)', height: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                    style={{ height: 50, cursor: 'pointer' }}
                    src={Logo.default}
                    onClick={() => navigate(ROUTES.LANDING)}
                    alt="Fizz Kidz Logo"
                />
            </Header>
            <Content style={{ background: colorBgContainer, padding: 32, margin: 32 }}>
                <Title style={{ marginTop: 0 }}>Payroll</Title>
                <Paragraph>
                    This tool is a way to generate timesheets for{' '}
                    <Link href="https://login.xero.com/identity/user/login">Xero</Link> based on the published roster in{' '}
                    <Link href="https://app.getsling.com/">Sling</Link>.
                </Paragraph>
                <Paragraph>
                    It will use the shifts location and position, as well as factor in the staffs age and overtime, to
                    calculate how many hours each employee worked at which pay item.
                </Paragraph>
                <Paragraph>
                    The tool will generate a csv file, ready for import into{' '}
                    <Link href="https://app.upsheets.com/login">UpSheets.</Link>
                </Paragraph>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <Text strong>Payroll period:</Text>
                        <RangePicker onChange={onChange} format="DD/MM/YYYY" />
                    </div>
                    <Button
                        type="primary"
                        loading={timesheetsService.status === 'loading'}
                        onClick={generateTimesheets}
                        disabled={selectedDates[0] === '' || selectedDates[1] === ''}
                    >
                        Generate Timesheets
                    </Button>
                </div>
                <Divider />
                {timesheetsService.status === 'error' && renderError(timesheetsService.error.details)}
                {timesheetsService.status === 'loaded' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <Title level={3} style={{ margin: 0 }}>
                            Result
                        </Title>
                        {timesheetsService.result.skippedEmployees.length !== 0 && (
                            <Alert
                                message="Skipped employees"
                                description={
                                    <>
                                        <Paragraph>
                                            The following employees timesheets were not generated because they could not
                                            be found in xero:
                                        </Paragraph>
                                        <ul>
                                            {timesheetsService.result.skippedEmployees.map((employee) => (
                                                <li>{employee}</li>
                                            ))}
                                        </ul>
                                    </>
                                }
                                type="warning"
                            />
                        )}
                        {timesheetsService.result.employeesWithBirthday.length !== 0 && (
                            <Card title="Employees with birthdays during pay run" size="small">
                                <ul>
                                    {timesheetsService.result.employeesWithBirthday.map((employee) => (
                                        <li>{employee}</li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                        <Button
                            shape="round"
                            type="primary"
                            block
                            onClick={() => window.open(timesheetsService.result.url, '_blank')}
                            icon={<DownloadOutlined />}
                        >
                            Download Timesheets
                        </Button>
                    </div>
                )}
            </Content>
        </Layout>
    )
}
