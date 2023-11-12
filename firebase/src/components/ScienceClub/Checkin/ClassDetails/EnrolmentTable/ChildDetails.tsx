import React, { useMemo, useState } from 'react'
import { styled } from '@mui/material/styles'
import { AcuityTypes, AcuityConstants, ScienceEnrolment } from 'fizz-kidz'
import { Button, Descriptions, Dropdown, MenuProps, Space, Tag, Typography } from 'antd'
import useWindowDimensions from '../../../../Hooks/UseWindowDimensions'
import { BREAKPOINT_LG, SetAppointmentLabel, UpdateEnrolment } from './EnrolmentTable'
import { DownOutlined } from '@ant-design/icons'
import { formatMobileNumber } from '../../../../../utilities/stringUtilities'
import { MenuItemType } from 'antd/es/menu/hooks/useItems'

const PREFIX = 'ChildDetails'

const classes = {
    description: `${PREFIX}-description`,
    dropdownBtn: `${PREFIX}-dropdownBtn`,
    signatureWrapper: `${PREFIX}-signatureWrapper`,
    signature: `${PREFIX}-signature`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
    [`& .${classes.description}`]: {
        '& th': {
            backgroundColor: '#f7f7f7f7 !important',
            fontWeight: 500,
        },
    },
    [`& .${classes.dropdownBtn}`]: {
        float: 'right',
        paddingTop: 8,
    },
    [`& .${classes.signatureWrapper}`]: {
        display: 'flex',
        flexDirection: 'column',
    },
    [`& .${classes.signature}`]: {
        maxWidth: 300,
        width: 'fit-content',
    },
})

type Props = {
    appointment: AcuityTypes.Api.Appointment
    enrolment: ScienceEnrolment
    setAppointmentLabel: SetAppointmentLabel
    updateEnrolment: UpdateEnrolment
}

type MenuKey = 'sign-in' | 'sign-out' | 'not-attending' | 'attending' | 'not-continuing'

const ChildDetails: React.FC<Props> = ({ appointment, enrolment, setAppointmentLabel, updateEnrolment }) => {
    const { width } = useWindowDimensions()

    const [loading, setLoading] = useState(false)

    const handleMenuClick = async (key: MenuKey) => {
        setLoading(true)
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
            case 'not-continuing':
                await updateEnrolment({ ...enrolment, continuingWithTerm: 'no' })
                break
            default: {
                const exhaustiveCheck: never = key
                console.error(`Unknown menu item: ${exhaustiveCheck}`)
            }
        }
        setLoading(false)
    }

    const menu = useMemo((): MenuProps => {
        const items: MenuItemType[] = []
        if (!appointment.labels) {
            items.push({
                key: 'not-attending',
                label: 'Mark Not Attending',
            })
            items.push({
                key: 'not-continuing',
                label: 'Not Continuing With Term',
            })
        }
        if (appointment.labels?.find((it) => it.id === AcuityConstants.Labels.CHECKED_IN)) {
            items.push({ key: 'sign-out', label: 'Undo Sign In' })
        }
        if (appointment.labels?.find((it) => it.id === AcuityConstants.Labels.CHECKED_OUT)) {
            items.push({ key: 'sign-in', label: 'Undo Sign Out' })
        }
        if (appointment.labels?.find((it) => it.id === AcuityConstants.Labels.NOT_ATTENDING)) {
            items.push({ key: 'attending', label: 'Mark As Attending' })
        }

        return {
            items,
            onClick: ({ key }) => handleMenuClick(key as MenuKey),
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appointment])

    return (
        <Root>
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
                {enrolment.child.anaphylaxisPlan && (
                    <Descriptions.Item label="Anaphylaxis Plan">
                        <Button href={enrolment.child.anaphylaxisPlan} target="_blank">
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
                <Descriptions.Item label="Parent Phone:">
                    <a href={`tel:${formatMobileNumber(enrolment.parent.phone)}`}>
                        {formatMobileNumber(enrolment.parent.phone)}
                    </a>
                </Descriptions.Item>
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
                    <a href={`tel:${formatMobileNumber(enrolment.emergencyContact.phone)}`}>
                        {formatMobileNumber(enrolment.emergencyContact.phone)}
                    </a>
                </Descriptions.Item>
                {enrolment.signatures[appointment.id] && (
                    <Descriptions.Item label="Signature">
                        <div className={classes.signatureWrapper}>
                            {
                                <img
                                    className={classes.signature}
                                    src={enrolment.signatures[appointment.id].signature}
                                    alt="signature"
                                />
                            }
                            <Typography.Text>
                                {enrolment.signatures[appointment.id].pickupPerson} -{' '}
                                {new Date(enrolment.signatures[appointment.id].timestamp).toLocaleString()}
                            </Typography.Text>
                        </div>
                    </Descriptions.Item>
                )}
            </Descriptions>
            <Dropdown placement="bottomRight" menu={menu} trigger={['click']}>
                <div className={classes.dropdownBtn}>
                    <Button loading={loading}>
                        <Space>
                            More
                            <DownOutlined />
                        </Space>
                    </Button>
                </div>
            </Dropdown>
        </Root>
    )
}

export default ChildDetails
