import React, { useEffect, useMemo, useState } from 'react'
import { Acuity, ScienceEnrolment } from 'fizz-kidz'
import { Button, Descriptions, Dropdown, Menu, MenuProps, Space, Tag, Typography } from 'antd'
import { makeStyles } from '@material-ui/core'
import useWindowDimensions from '../../../../Hooks/UseWindowDimensions'
import { BREAKPOINT_LG, SetAppointmentLabel } from './EnrolmentTable'
import useFirebase from '../../../../Hooks/context/UseFirebase'
import { DownOutlined } from '@ant-design/icons'

type Props = {
    appointment: Acuity.Appointment
    enrolment: ScienceEnrolment
    setAppointmentLabel: SetAppointmentLabel
}

type MenuKey = 'sign-in' | 'sign-out' | 'not-attending' | 'attending'

const ChildDetails: React.FC<Props> = ({ appointment, enrolment, setAppointmentLabel }) => {
    const classes = useStyles()
    const { width } = useWindowDimensions()
    const firebase = useFirebase()

    const [loading, setLoading] = useState(false)
    const [anaphylaxisUrl, setAnaphylaxisUrl] = useState('')

    useEffect(() => {
        async function getUrl() {
            if (enrolment.child.isAnaphylactic) {
                const url = await firebase.storage
                    .ref(`anaphylaxisPlans/${enrolment.id}/${enrolment.child.anaphylaxisPlan}`)
                    .getDownloadURL()
                setAnaphylaxisUrl(url)
            }
        }
        getUrl()
    }, [])

    const handleMenuClick: MenuProps['onClick'] = async (e) => {
        setLoading(true)
        const key = e.key as MenuKey
        switch (key) {
            case 'sign-in':
                await setAppointmentLabel(appointment.id, 'signed-in')
                break
            case 'sign-out':
            case 'attending':
                await setAppointmentLabel(appointment.id, 'none')
                break
            case 'not-attending':
                await setAppointmentLabel(appointment.id, 'not-attending')
                break
        }
        setLoading(false)
    }

    const menu = useMemo(() => {
        const items: { key: MenuKey; label: string }[] = []
        if (!appointment.labels) {
            items.push({
                key: 'not-attending',
                label: 'Mark Not Attending',
            })
        }
        if (appointment.labels?.find((it) => it.id === Acuity.Constants.Labels.CHECKED_IN)) {
            items.push({ key: 'sign-out', label: 'Undo Sign In' })
        }
        if (appointment.labels?.find((it) => it.id === Acuity.Constants.Labels.CHECKED_OUT)) {
            items.push({ key: 'sign-in', label: 'Undo Sign Out' })
        }
        if (appointment.labels?.find((it) => it.id === Acuity.Constants.Labels.NOT_ATTENDING)) {
            items.push({ key: 'attending', label: 'Mark As Attending' })
        }

        return <Menu items={items} onClick={handleMenuClick} />
    }, [appointment])

    return (
        <>
            <Descriptions className={classes.description} bordered size="small" column={1}>
                {width < BREAKPOINT_LG && (
                    <>
                        <Descriptions.Item label="Child Age:">{enrolment.child.age}</Descriptions.Item>
                        <Descriptions.Item label="Child Grade:">
                            <Tag color={enrolment.child.grade === 'Prep' ? 'green' : undefined}>
                                {enrolment.child.grade.toUpperCase()}
                            </Tag>
                        </Descriptions.Item>
                    </>
                )}
                {enrolment.child.isAnaphylactic && (
                    <Descriptions.Item label="Anaphylaxis Plan">
                        <Button disabled={anaphylaxisUrl === ''} href={anaphylaxisUrl} target="_blank">
                            View Plan
                        </Button>
                    </Descriptions.Item>
                )}
                {enrolment.child.allergies && (
                    <Descriptions.Item label="Allergies:">{enrolment.child.allergies}</Descriptions.Item>
                )}
                <Descriptions.Item label="Parent Name:">
                    {enrolment.parent.firstName} {enrolment.parent.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Parent Phone:">{enrolment.parent.phone}</Descriptions.Item>
                <Descriptions.Item label="Parent Email:">{enrolment.parent.email}</Descriptions.Item>
                <Descriptions.Item label="Pickup People:">
                    {enrolment.pickupPeople.map((it) => (
                        <div key={it}>{it}</div>
                    ))}
                </Descriptions.Item>
                <Descriptions.Item label="Emergency Contact Name:">{enrolment.emergencyContact.name}</Descriptions.Item>
                <Descriptions.Item label="Emergency Contact Relation:">
                    {enrolment.emergencyContact.relation}
                </Descriptions.Item>
                <Descriptions.Item label="Emergency Contact Phone:">
                    {enrolment.emergencyContact.phone}
                </Descriptions.Item>
                {enrolment.signatures[appointment.id] && (
                    <Descriptions.Item label="Signature">
                        <div className={classes.signatureWrapper}>
                            {<img className={classes.signature} src={enrolment.signatures[appointment.id].signature} />}
                            <Typography.Text>
                                {enrolment.signatures[appointment.id].pickupPerson} -{' '}
                                {new Date(enrolment.signatures[appointment.id].timestamp).toLocaleString()}
                            </Typography.Text>
                        </div>
                    </Descriptions.Item>
                )}
            </Descriptions>
            <Dropdown placement="bottomRight" overlay={menu} trigger={['click']}>
                <div className={classes.dropdownBtn}>
                    <Button loading={loading}>
                        <Space>
                            More
                            <DownOutlined />
                        </Space>
                    </Button>
                </div>
            </Dropdown>
        </>
    )
}

const useStyles = makeStyles({
    description: {
        '& th': {
            backgroundColor: '#f7f7f7f7 !important',
            fontWeight: 500,
        },
    },
    dropdownBtn: {
        float: 'right',
        paddingTop: 8,
    },
    signatureWrapper: {
        display: 'flex',
        flexDirection: 'column',
    },
    signature: {
        maxWidth: 300,
        width: 'fit-content',
    },
})

export default ChildDetails
