import { useState } from 'react'
import { styled } from '@mui/material/styles'
import { Alert, Button, DatePicker, Typography, Layout, theme, Divider, Card, Collapse } from 'antd'
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
const PREFIX = 'Payroll'

const classes = {
    header: `${PREFIX}-header`,
    flexCol: `${PREFIX}-flexCol`,
    list: `${PREFIX}-list`,
    'gap-16': `${PREFIX}-gap-16`,
}

const StyledLayout = styled(Layout)({
    [`& .${classes.header}`]: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    [`& .${classes.flexCol}`]: {
        display: 'flex',
        flexDirection: 'column',
    },
    [`& .${classes['gap-16']}`]: { gap: 16 },
    [`& .${classes.list}`]: {
        '& li': {
            marginBottom: 8,
        },
    },
})

const { RangePicker } = DatePicker
const { Title, Paragraph, Text, Link } = Typography
const { Header, Content } = Layout
const { Panel } = Collapse

dayjs.extend(updateLocale)
dayjs.updateLocale('en', { weekStart: 1 })

export const Payroll = () => {
    const firebase = useFirebase()

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
        <StyledLayout style={{ background: 'rgb(240, 242, 245)', minHeight: '100vh' }}>
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
                <Paragraph>Overtime is calculated in the following way:</Paragraph>
                <ul>
                    <li>Any hours worked above 10 hours in a day.</li>
                    <li>
                        Any hours worked above 38 hours in a single week.
                        <br />
                        <br />
                        <em>
                            <strong>Note:</strong>
                            <br />
                            If an employees first three hours of overtime are on a Sunday, their pay item will be their
                            Sunday rates. <br /> This is because the first three hours of overtime multiplier (1.5x) is
                            less than their Sunday multiplier (1.75x).
                        </em>
                    </li>
                </ul>
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
                                                The following employees' timesheets were not generated because they
                                                could not be found in Xero:
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
                                                pay template for 'Staff - Ordinary Hours'.
                                            </li>
                                            <li>
                                                Inside Sling, the 'Employee ID' field has been provided under the
                                                employees 'Work' tab. This ID should come from their profile in Xero.
                                            </li>
                                            <li>
                                                Check if this is the first pay run for this employee. If not,{' '}
                                                <strong>
                                                    we will need to backpay them for any previously missed pay cycles.
                                                </strong>
                                            </li>
                                            <li>Regenarate the timesheets.</li>
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
                                    description={
                                        <>
                                            <Paragraph>
                                                The following employees have birthdays during this pay cycle:
                                            </Paragraph>
                                            <ul>
                                                {timesheetsService.result.employeesWithBirthday.map((employee, idx) => (
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
                                                    <strong>Note:</strong>
                                                    <br /> If the employee turned 18, the pay items may need adjusting!
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
                        {timesheetsService.result.employeesUnder18Over30Hrs.length > 0 ? (
                            <>
                                <Alert
                                    description={
                                        <>
                                            <Paragraph>
                                                The following employees are under 18 but worked more than 30 hours in a
                                                single week within the pay cycle, and therefore need to be paid
                                                superannuation:
                                            </Paragraph>
                                            <ul>
                                                {timesheetsService.result.employeesUnder18Over30Hrs.map(
                                                    (employee, idx) => (
                                                        <li key={idx}>{employee}</li>
                                                    )
                                                )}
                                            </ul>
                                        </>
                                    }
                                    type="warning"
                                    showIcon
                                />
                            </>
                        ) : (
                            <Alert
                                type="success"
                                message="No employees under 18 worked more than 30 hours in a week."
                                showIcon
                            />
                        )}
                        <Divider />
                        <Card title="Next Steps" size="small">
                            <ol className={classes.list}>
                                <li>Download the generated timesheets below.</li>
                                <li>Double check all overtime pay items are correct.</li>
                                <li>
                                    If there are any birthdays, remove any lines before their birthday as described
                                    above.
                                </li>
                                <li>
                                    Upload the timesheets into{' '}
                                    <Link href="https://app.upsheets.com/login">UpSheets</Link>, and import into Xero.
                                </li>
                                <li>Create the pay run.</li>
                                <li>
                                    For all employees with birthdays, add their shifts before their birthday as
                                    adjustments to their payslip, as described above.
                                </li>
                                <li>
                                    Review the 'notes' column in the generated timesheets file for any reimbursements
                                    required, such as petrol for KM's travelled, and add adjustments to their payslip.
                                </li>
                                <li>
                                    Include superannuation for all employees under 18 who worked more than 30 hours, as
                                    listed above.
                                </li>
                            </ol>
                        </Card>
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
        </StyledLayout>
    )
}
