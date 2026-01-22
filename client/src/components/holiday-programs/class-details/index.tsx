import { styled } from '@mui/material/styles'
import { Card, Collapse, Empty } from 'antd'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'
import type { AcuityTypes } from 'fizz-kidz'

import useFetchAppointments from '@components/Hooks/api/UseFetchAppointments'
import useWindowDimensions from '@components/Hooks/UseWindowDimensions'
import SkeletonRows from '@components/Shared/SkeletonRows'

import ChildExpansionPanel from './ChildExpansionPanel'

const PREFIX = 'ClassDetailsPage'

const classes = {
    main: `${PREFIX}-main`,
    root: `${PREFIX}-root`,
    card: `${PREFIX}-card`,
}

const Root = styled('div')({
    [`& .${classes.root}`]: {
        // backgroundColor: '#f0f2f2',
        backgroundImage: 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)',
        minHeight: '100vh',
        paddingBottom: 24,
        paddingLeft: 24,
        paddingRight: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    [`& .${classes.card}`]: {
        width: '100%',
        height: 'fit-content',
        borderRadius: 16,
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
    },
})

export const ClassDetailsPage = () => {
    const { height } = useWindowDimensions()

    const [loading, setLoading] = useState(true)

    const [searchParams] = useSearchParams()
    const appointmentTypeId = parseInt(searchParams.get('appointmentTypeId')!)
    const calendarId = parseInt(searchParams.get('calendarId')!)
    const classId = parseInt(searchParams.get('classId')!)
    const classTime = decodeURIComponent(searchParams.get('classTime')!)

    const classDisplayable = useMemo(
        () =>
            DateTime.fromISO(classTime).toLocaleString({
                weekday: 'short',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }),
        [classTime]
    )

    const sortByChildName = (a: AcuityTypes.Api.Appointment, b: AcuityTypes.Api.Appointment) => {
        const aName = AcuityUtilities.retrieveFormAndField(
            a,
            AcuityConstants.Forms.CHILDREN_DETAILS,
            AcuityConstants.FormFields.CHILDREN_NAMES
        ) as string
        const bName = AcuityUtilities.retrieveFormAndField(
            b,
            AcuityConstants.Forms.CHILDREN_DETAILS,
            AcuityConstants.FormFields.CHILDREN_NAMES
        ) as string
        return aName.toUpperCase() < bName.toUpperCase() ? -1 : aName > bName ? 1 : 0
    }

    const appointments = useFetchAppointments({
        setLoading,
        appointmentTypeId,
        calendarId,
        classId,
        classTime,
        sorter: sortByChildName,
    }) as AcuityTypes.Api.Appointment[]

    return (
        <Root>
            <div className={classes.root}>
                <h1 className="lilita rounded-2xl bg-slate-700 bg-opacity-40 p-4 text-2xl text-white">
                    {classDisplayable}
                </h1>
                <Card className={classes.card}>
                    {appointments !== null && appointments.length !== 0 && (
                        <Collapse accordion>
                            {appointments.map((appointment) => (
                                <ChildExpansionPanel key={appointment.id} appointment={appointment} />
                            ))}
                        </Collapse>
                    )}
                    {appointments === null && (
                        <Empty description="No enrolments" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                    {loading && <SkeletonRows rowCount={(height - 64) / 64} />}
                </Card>
            </div>
        </Root>
    )
}
