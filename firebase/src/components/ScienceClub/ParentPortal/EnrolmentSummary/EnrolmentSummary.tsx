import React from 'react'
import { Card, Col, Row } from 'antd'
import { ScienceAppointment } from 'fizz-kidz'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'
import InvoiceDetails from '../InvoiveDetails/InvoiceDetails'
import { makeStyles } from '@material-ui/core'

const BREAK_LARGE = 990
const BREAK_SMALL = 515

type Props = {
    appointment: ScienceAppointment
}

const EnrolmentSummary: React.FC<Props> = ({ appointment }) => {
    const classes = useStyles()

    const { width } = useWindowDimensions()

    return (
        <Row justify="space-between" gutter={[32, 12]} style={{ marginTop: 24 }}>
            <Col span={width > BREAK_LARGE ? 9 : 24}>
                <Card className={classes.card} title="🧪 Program">
                    <p>{appointment.className}</p>
                </Card>
            </Col>
            <Col span={width > BREAK_LARGE ? 9 : width > BREAK_SMALL ? 12 : 24}>
                <Card className={classes.card} title="👩‍🔬 Child Enrolled">
                    <p>
                        {appointment.childFirstName} {appointment.childLastName}
                    </p>
                </Card>
            </Col>
            <Col span={width > BREAK_LARGE ? 6 : width > BREAK_SMALL ? 12 : 24}>
                <InvoiceDetails appointment={appointment} />
            </Col>
        </Row>
    )
}

const useStyles = makeStyles({
    card: {
        height: '100%',
        boxShadow: 'rgba(100, 100, 111, 0.15) 0px 7px 29px 0px',
    },
})

export default EnrolmentSummary
