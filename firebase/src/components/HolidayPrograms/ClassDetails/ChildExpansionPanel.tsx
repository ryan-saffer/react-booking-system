import React, { useState, useContext } from 'react'

import { Acuity } from 'fizz-kidz'

import { makeStyles } from '@material-ui/styles'
import { Collapse, Button as AntButton, List, Tag } from 'antd'
import Firebase, { FirebaseContext } from '../../Firebase'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { formatMobileNumber } from '../../../utilities/stringUtilities'
const { Panel } = Collapse

type Props = {
    appointment: Acuity.Appointment
}

const ChildExpansionPanel: React.FC<Props> = ({ appointment: originalAppointment, ...props }) => {
    const classes = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase

    const [appointment, setAppointment] = useState(originalAppointment)
    const [loading, setLoading] = useState(false)

    const notSignedIn = appointment.labels === null
    const isSignedIn = appointment.labels !== null && appointment.labels[0].id === Acuity.Constants.Labels.CHECKED_IN

    const childName = Acuity.Utilities.retrieveFormAndField(
        appointment,
        Acuity.Constants.Forms.CHILDREN_DETAILS,
        Acuity.Constants.FormFields.CHILDREN_NAMES
    )
    const allergies = Acuity.Utilities.retrieveFormAndField(
        appointment,
        Acuity.Constants.Forms.CHILDREN_DETAILS,
        Acuity.Constants.FormFields.CHILDREN_ALLERGIES
    )
    const emergencyContactName = Acuity.Utilities.retrieveFormAndField(
        appointment,
        Acuity.Constants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
        Acuity.Constants.FormFields.EMERGENCY_CONTACT_NAME_HP
    )
    const emergencyContactNumber = Acuity.Utilities.retrieveFormAndField(
        appointment,
        Acuity.Constants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
        Acuity.Constants.FormFields.EMERGENCY_CONTACT_NUMBER_HP
    )
    const hasAllergies = allergies !== ''
    const stayingAllDay = appointment.certificate === 'ALLDAY'

    const updateLabel = (value: number | null) => {
        firebase.functions
            .httpsCallable('acuityClient')({
                auth: firebase.auth.currentUser?.toJSON(),
                data: { method: 'updateLabel', clientId: appointment.id, label: value },
            })
            .then((result) => {
                console.log(result)
                setAppointment(result.data)
                setLoading(false)
            })
            .catch((err) => {
                console.error(err)
                setLoading(false)
            })
    }

    const handleSignIn = (e: any) => {
        e.stopPropagation()
        setLoading(true)

        updateLabel(Acuity.Constants.Labels.CHECKED_IN)
    }

    const handleSignOut = (e: any) => {
        e.stopPropagation()
        setLoading(true)

        console.log(appointment.id)

        updateLabel(null)
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
        <Panel className={classes.panel} header={childName} key={appointment.id} {...props} extra={renderExtra()}>
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
        </Panel>
    )
}

const useStyles = makeStyles({
    panel: {
        '& .ant-collapse-header': {
            alignItems: 'center !important',
        },
    },
})

export default ChildExpansionPanel
