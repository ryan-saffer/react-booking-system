import React, { useState } from 'react'
import { Alert, Button, DatePicker, Typography, Layout, theme, Divider, Card, Result, Collapse } from 'antd'
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
import { makeStyles } from '@material-ui/core'

const { RangePicker } = DatePicker
const { Title, Paragraph, Text, Link } = Typography
const { Header, Content } = Layout
const { Panel } = Collapse

dayjs.extend(updateLocale)
dayjs.updateLocale('en', { weekStart: 1 })

type Props = {}

export const Payroll: React.FC<Props> = ({}) => {
    const firebase = useFirebase()
    const classes = useStyles()

    const {
        token: { colorBgContainer },
    } = theme.useToken()

    const navigate = useNavigate()

    const [selectedDates, setSelectedDates] = useState<[string, string]>(['', ''])
    const [timesheetsService, setTimesheetsService] = useState<Service<GenerateTimesheetsResponse>>({ status: 'init' })

    const onChange: RangePickerProps['onChange'] = async (_, format) => {
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

        if (error?.errorCode === 'invalid-length') {
            message = 'Invalid range'
            description = 'The date range must be 28 days or less'
        }
        return <Alert message={message} description={description} type="error" showIcon closable />
    }

    return (
        <Layout style={{ background: 'rgb(240, 242, 245)', minHeight: '100vh' }}>
            <Header className={classes.header}>
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
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Title level={3} style={{ margin: 0 }}>
                            Result
                        </Title>
                        <Divider orientation="left">Skipped employees</Divider>
                        {timesheetsService.result.skippedEmployees.length !== 0 ? (
                            <div className={`${classes.flexCol} ${classes['gap-16']}`}>
                                <Alert
                                    description={
                                        <>
                                            <Paragraph>
                                                The following employees timesheets were not generated because they could
                                                not be found in xero:
                                            </Paragraph>
                                            <ul>
                                                {timesheetsService.result.skippedEmployees.map((employee, idx) => (
                                                    <li key={idx}>{employee}</li>
                                                ))}
                                            </ul>
                                        </>
                                    }
                                    type="warning"
                                    showIcon
                                />
                                <Collapse>
                                    <Panel
                                        key="1"
                                        header={
                                            <Paragraph style={{ margin: 0 }} strong>
                                                How to resolve this
                                            </Paragraph>
                                        }
                                    >
                                        <Paragraph>
                                            Ensure that all of the following steps have been followed:
                                        </Paragraph>
                                        <ol className={classes.list}>
                                            <li>
                                                Employee has been created in Xero, along with tax details and a default
                                                pay template for 'Staff - Ordinary Hours'
                                            </li>
                                            <li>
                                                Inside Sling, the 'Employee ID' field has been provided under the
                                                employees 'Work' tab. This ID should come from their profile in Xero.
                                            </li>
                                        </ol>
                                    </Panel>
                                </Collapse>
                            </div>
                        ) : (
                            <Alert message="All employees successfully found in Xero." type="success" showIcon />
                        )}
                        <Divider orientation="left">Employee Birthdays</Divider>
                        {timesheetsService.result.employeesWithBirthday.length !== 0 ? (
                            <div className={`${classes.flexCol} ${classes['gap-16']}`}>
                                <Alert
                                    message="Some employees have birthdays during this pay cycle"
                                    type="warning"
                                    showIcon
                                />
                                <Card title="Employees with birthdays during pay run" size="small">
                                    <ul>
                                        {timesheetsService.result.employeesWithBirthday.map((employee, idx) => (
                                            <li key={idx}>{employee}</li>
                                        ))}
                                    </ul>
                                </Card>
                                <Collapse>
                                    <Panel
                                        key="1"
                                        header={
                                            <Paragraph style={{ margin: 0 }} strong>
                                                How to resolve this
                                            </Paragraph>
                                        }
                                    >
                                        <Paragraph>Perform the following steps:</Paragraph>
                                        <ol className={classes.list}>
                                            <li>
                                                Does the employees rate need to change because of their birthday? If
                                                not, do nothing.
                                            </li>
                                            <li>Change their pay template in Xero to their new Ordinary Rate.</li>
                                            <li>
                                                After downloading the timesheets below, remove all rows for this
                                                employee for any hours worked <strong>before their birthday.</strong>{' '}
                                                Make sure you keep a copy of these rows, as you will need them later.
                                            </li>
                                            <li>
                                                Once the timesheets have been uploaded into Xero, and you have created
                                                the pay run, add adjustments for this employee using the rows that were
                                                removed in step 3. Ensure these adjustments are at the employees{' '}
                                                <strong>previous rate.</strong>
                                                <br />
                                                <br />
                                                <em>
                                                    Note: If the employee turned 18, the pay items may need adjusting!
                                                </em>
                                            </li>
                                        </ol>
                                    </Panel>
                                </Collapse>
                            </div>
                        ) : (
                            <Alert message="No birthdays during this pay cycle." type="success" showIcon />
                        )}
                        <Divider orientation="left">Superannuation</Divider>
                        <Alert
                            type="warning"
                            message="TODO - Show employees who are under 18 that worked over 30 hours in a single week"
                            showIcon
                        />
                        <Divider />
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

const useStyles = makeStyles({
    header: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    flexCol: {
        display: 'flex',
        flexDirection: 'column',
    },
    'gap-16': { gap: 16 },
    list: {
        '& li': {
            marginBottom: 8,
        },
    },
})
