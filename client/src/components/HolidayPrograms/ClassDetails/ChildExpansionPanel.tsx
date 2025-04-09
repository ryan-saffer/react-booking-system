import { Button as AntButton, Collapse, List, Tag } from 'antd'
import { AcuityConstants, AcuityTypes, AcuityUtilities } from 'fizz-kidz'
import React, { useState } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import { styled } from '@mui/material/styles'
import { formatMobileNumber } from '@utils/stringUtilities'
import { trpc } from '@utils/trpc'

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
    const [appointment, setAppointment] = useState(originalAppointment)
    const [loading, setLoading] = useState(false)

    const updateLabelMutation = trpc.acuity.updateLabel.useMutation()

    const notSignedIn = appointment.labels === null
    const isSignedIn = appointment.labels && appointment.labels[0].id === AcuityConstants.Labels.CHECKED_IN

    const childName = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_NAMES
    )
    const childAge = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_AGES
    )

    const allergies = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_ALLERGIES
    )
    const additionalInfo = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILD_ADDITIONAL_INFO
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
            const result = await updateLabelMutation.mutateAsync({
                appointmentId: appointment.id,
                label: value,
            })

            setAppointment(result)
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
            label: 'Allergies',
            value: allergies,
            render: hasAllergies,
        },
        {
            label: 'Notes',
            value: additionalInfo,
            render: !!additionalInfo,
        },
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
                {!!additionalInfo && <Tag color="magenta">Includes Notes</Tag>}
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
        <StyledPanel
            className={classes.panel}
            header={
                <p style={{ margin: 0 }}>
                    {childName} <i>({childAge})</i>
                </p>
            }
            key={appointment.id}
            {...props}
            extra={renderExtra()}
        >
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
