import React, { useState } from 'react'

import { styled } from '@mui/material/styles'

import { AcuityConstants, AcuityUtilities, AcuityTypes } from 'fizz-kidz'

import { Collapse, Button as AntButton, List, Tag } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { formatMobileNumber } from '../../../utilities/stringUtilities'
import { callAcuityClient } from '../../../utilities/firebase/functions'
import useFirebase from '../../Hooks/context/UseFirebase'

const { Panel } = Collapse

const PREFIX = 'ChildExpansionPanel'

const classes = {
    panel: `${PREFIX}-panel`,
}

const StyledPanel = styled(Panel)({
    [`&.${classes.panel}`]: {
        '& .ant-collapse-header': {
            alignItems: 'center !important',
        },
    },
})

type Props = {
    appointment: AcuityTypes.Api.Appointment
}

const ChildExpansionPanel: React.FC<Props> = ({ appointment: originalAppointment, ...props }) => {
    const firebase = useFirebase()

    const [appointment, setAppointment] = useState(originalAppointment)
    const [loading, setLoading] = useState(false)

    const notSignedIn = appointment.labels === null
    const isSignedIn = appointment.labels !== null && appointment.labels[0].id === AcuityConstants.Labels.CHECKED_IN

    const childName = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_NAMES
    )
    const allergies = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_ALLERGIES
    )
    const emergencyContactName = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
        AcuityConstants.FormFields.EMERGENCY_CONTACT_NAME_HP
    )
    const emergencyContactNumber = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
        AcuityConstants.FormFields.EMERGENCY_CONTACT_NUMBER_HP
    )
    const hasAllergies = allergies !== ''
    const stayingAllDay = appointment.certificate === 'ALLDAY'

    const updateLabel = async (value: AcuityTypes.Client.Label) => {
        try {
            const result = await callAcuityClient(
                'updateLabel',
                firebase
            )({
                appointmentId: appointment.id,
                label: value,
            })

            setAppointment(result.data)
            setLoading(false)
        } catch (err) {
            console.error(err)
            setLoading(false)
        }
    }

    const handleSignIn = (e: any) => {
        e.stopPropagation()
        setLoading(true)
        updateLabel('checked-in')
    }

    const handleSignOut = (e: any) => {
        e.stopPropagation()
        setLoading(true)
        updateLabel('none')
    }

    const childInfo = [
        {
            label: 'Parent Name',
            value: `${appointment.firstName} ${appointment.lastName}`,
            render: true,
        },
        {
            label: 'Parent Phone',
            value: formatMobileNumber(appointment.phone),
            render: true,
        },
        {
            label: 'Parent Email',
            value: appointment.email,
            render: true,
        },
        {
            label: 'Emergency Contact',
            value: emergencyContactName,
            render: true,
        },
        {
            label: 'Emergency Contact Number',
            value: emergencyContactNumber,
            render: true,
        },
        {
            label: 'Allergies',
            value: allergies,
            render: hasAllergies,
        },
    ]

    const renderExtra = () => {
        return (
            <>
                {hasAllergies && (
                    <Tag color="red" icon={<ExclamationCircleOutlined />}>
                        Allergy
                    </Tag>
                )}
                {stayingAllDay && <Tag color="geekblue">All Day</Tag>}
                {notSignedIn && (
                    <AntButton
                        style={{ background: '#B14592', color: 'white' }}
                        loading={loading}
                        onClick={handleSignIn}
                    >
                        Sign in
                    </AntButton>
                )}
            </>
        )
    }

    return (
        <StyledPanel className={classes.panel} header={childName} key={appointment.id} {...props} extra={renderExtra()}>
            <List
                dataSource={childInfo}
                renderItem={(item) =>
                    item.render && (
                        <List.Item>
                            {<strong>{item.label}</strong>}: {item.value}
                        </List.Item>
                    )
                }
            />
            {isSignedIn && (
                <div style={{ display: 'flex', justifyContent: 'end' }}>
                    <AntButton
                        style={{ backgroundColor: '#fff1f0', borderColor: '#ffa39e', color: '#cf1322' }}
                        loading={loading}
                        onClick={handleSignOut}
                    >
                        Undo Sign In
                    </AntButton>
                </div>
            )}
        </StyledPanel>
    )
}

export default ChildExpansionPanel
