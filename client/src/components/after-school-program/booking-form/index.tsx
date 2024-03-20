import { Alert, Button, Result, Typography } from 'antd'
import { AcuityTypes, Calendar, ScheduleAfterSchoolEnrolmentParams } from 'fizz-kidz'
import { useCallback, useEffect, useState } from 'react'

import { LeftOutlined } from '@ant-design/icons'
import useFirebase from '@components/Hooks/context/UseFirebase'
import useMixpanel from '@components/Hooks/context/UseMixpanel'
import { MixpanelEvents } from '@components/Mixpanel/Events'
import Root from '@components/Shared/Root'
import { Grow } from '@mui/material'
import { trpc } from '@utils/trpc'

import Loader from '../shared/Loader'
import AppointmentTypeCard from './AppointmentTypeCard'
import FormSwitcher from './FormSwitcher'
import styles from './main.module.css'

export type FormSubmission = (params: ScheduleAfterSchoolEnrolmentParams) => void

export const BookingForm = () => {
    const firebase = useFirebase()
    const mixpanel = useMixpanel()

    const [classType, setClassType] = useState<'science' | 'art' | ''>('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [success, setSuccess] = useState(false)
    const [appointmentTypes, setAppointmentTypes] = useState<AcuityTypes.Api.AppointmentType[]>()
    const [selectedClass, setSelectedClass] = useState<AcuityTypes.Api.AppointmentType>()
    const [logoMap, setLogoMap] = useState<{ [key: string]: string }>()

    const {
        data,
        isLoading: loadingAppointmentTypes,
        isError: errorLoadingAppointmentTypes,
    } = trpc.acuity.getAppointmentTypes.useQuery({
        category: import.meta.env.VITE_ENV === 'prod' ? ['Science Club', 'Art Program'] : ['TEST-science', 'TEST-art'],
        availableToBook: true,
    })
    const scheduleAfterSchoolEnrolmentMutation = trpc.afterSchoolProgram.scheduleAfterSchoolEnrolment.useMutation()

    const filterAppointmentTypes = useCallback(
        (type: 'science' | 'art' | '') => {
            setAppointmentTypes(
                data?.filter((it) => {
                    if (['Science Club', 'TEST-science'].includes(it.category) && type === 'science') {
                        return true
                    } else if (['Art Program', 'TEST-art'].includes(it.category) && type === 'art') {
                        return true
                    }
                    return false
                })
            )
            setClassType(type)
        },
        [data]
    )

    useEffect(() => {
        filterAppointmentTypes(classType)
    }, [classType, data, filterAppointmentTypes])

    useEffect(() => {
        async function onLoad() {
            const calendars = await firebase.db.collection('acuityCalendars').get()
            setLogoMap(
                Object.assign(
                    {},
                    ...calendars.docs.map((it) => {
                        const calendar = it.data() as Calendar
                        return { [calendar.id]: calendar.logoUrl }
                    })
                )
            )
            mixpanel.track(MixpanelEvents.SCIENCE_FORM_VIEW)
        }

        onLoad()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSubmit = async (params: ScheduleAfterSchoolEnrolmentParams) => {
        setLoading(true)
        const mixpanelProps = {
            appointment_type: params.className,
            parent_email: params.parent.email,
        }
        try {
            await scheduleAfterSchoolEnrolmentMutation.mutateAsync(params)
            setSuccess(true)
            window.scrollTo({ top: 0 })
            mixpanel.track(MixpanelEvents.SCIENCE_FORM_ENROLMENT_CONFIRMED, mixpanelProps)
        } catch (err) {
            console.error(err)
            setError(true)
            mixpanel.track(MixpanelEvents.SCIENCE_FORM_ERROR_SUBMITTING_FORM, mixpanelProps)
        }
        setLoading(false)
    }

    const renderClassSelection = () => {
        if (loading || loadingAppointmentTypes) {
            return <Loader style={{ marginTop: 24 }} />
        }
        if (selectedClass && logoMap) {
            return (
                <>
                    <Button
                        style={{ width: 'fit-content', marginBottom: 8 }}
                        icon={<LeftOutlined />}
                        onClick={() => {
                            // getAppointmentTypes()
                            setSelectedClass(undefined)
                        }}
                    >
                        Go back
                    </Button>
                    <Grow>
                        <AppointmentTypeCard
                            appointmentType={selectedClass}
                            logoUrl={logoMap[selectedClass.calendarIDs[0]]}
                            onClick={() => {}}
                        />
                    </Grow>
                </>
            )
        }
        if (appointmentTypes?.length && logoMap) {
            return (
                <>
                    <Button
                        style={{ width: 'fit-content', marginBottom: 8 }}
                        icon={<LeftOutlined />}
                        onClick={() => {
                            setClassType('')
                        }}
                    >
                        Go back
                    </Button>
                    {appointmentTypes
                        .filter((it) => {
                            if (['Science Club', 'TEST-science'].includes(it.category) && classType === 'science') {
                                return true
                            } else if (['Art Program', 'TEST-art'].includes(it.category) && classType === 'art') {
                                return true
                            }
                            return false
                        })
                        .map((it) => (
                            <AppointmentTypeCard
                                key={it.id}
                                appointmentType={it}
                                logoUrl={logoMap[it.calendarIDs[0]]}
                                onClick={() => setSelectedClass(it)}
                            />
                        ))}
                </>
            )
        } else {
            return (
                <>
                    <Button
                        style={{ width: 'fit-content', marginBottom: 8 }}
                        icon={<LeftOutlined />}
                        onClick={() => {
                            setClassType('')
                        }}
                    >
                        Go back
                    </Button>
                    <Alert
                        message="No classes available"
                        description="Unfortunately there are no classes available to book at the moment. Please try again later."
                        type="error"
                    />
                </>
            )
        }
    }

    return (
        <Root width="centered">
            <Typography.Title level={4} style={{ margin: 8, textAlign: 'center' }}>
                After School Program Enrolment Form
            </Typography.Title>
            {(() => {
                if (error || errorLoadingAppointmentTypes) {
                    return (
                        <Result
                            status="500"
                            title="Something went wrong"
                            subTitle="Please try again later, or reach out via email at bookings@fizzkidz.com.au."
                        />
                    )
                }

                if (success) {
                    return (
                        <Result
                            status="success"
                            title="Enrolment Confirmed"
                            subTitle="We've sent you a confirmation email, as well as an email where you can manage your enrolment. We can't wait to see you at the start of term!"
                        />
                    )
                }

                if (classType === '') {
                    return (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                marginTop: 18,
                            }}
                        >
                            <Typography>Which program do you want to enrol into?</Typography>
                            {(
                                [
                                    {
                                        program: 'science',
                                        displayName: 'Science Program',
                                        icon: 'thermometer',
                                        color: '4BC5D9',
                                    },
                                    {
                                        program: 'art',
                                        displayName: 'Art & Makers Program',
                                        icon: 'palette',
                                        color: 'E91171',
                                    },
                                ] as const
                            ).map((it) => (
                                <div
                                    key={it.program}
                                    className={styles.listItem}
                                    onClick={() => filterAppointmentTypes(it.program)}
                                >
                                    <img
                                        src={`https://api.dicebear.com/7.x/icons/svg?icon=${it.icon}&scale=100&backgroundColor=${it.color}`}
                                        width={60}
                                        alt={`${it.program} icon`}
                                    />
                                    <h4 className="gotham">{it.displayName}</h4>
                                </div>
                            ))}
                        </div>
                    )
                }

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        {renderClassSelection()}
                        {selectedClass && (
                            <FormSwitcher type={classType} appointmentType={selectedClass} onSubmit={handleSubmit} />
                        )}
                    </div>
                )
            })()}
        </Root>
    )
}
