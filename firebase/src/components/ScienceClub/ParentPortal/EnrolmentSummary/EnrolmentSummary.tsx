import React from 'react'
import { styled } from '@mui/material/styles';
import { Card, Col, Row } from 'antd'
import { ScienceEnrolment } from 'fizz-kidz'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'
import InvoiceDetails from '../InvoiveDetails/InvoiceDetails'
const PREFIX = 'EnrolmentSummary';

const classes = {
    card: `${PREFIX}-card`
};

const StyledRow = styled(Row)({
    [`& .${classes.card}`]: {
        height: '100%',
        boxShadow: 'rgba(100, 100, 111, 0.15) 0px 7px 29px 0px',
    },
});

const BREAK_LARGE = 990
const BREAK_SMALL = 515

type Props = {
    appointment: ScienceEnrolment
}

const EnrolmentSummary: React.FC<Props> = ({ appointment }) => {


    const { width } = useWindowDimensions()

    return (
        <StyledRow justify="space-between" gutter={[32, 12]} style={{ marginTop: 24 }}>
            <Col span={width > BREAK_LARGE ? 9 : 24}>
                <Card className={classes.card} title="🧪 Program">
                    <p>{appointment.className}</p>
                </Card>
            </Col>
            <Col span={width > BREAK_LARGE ? 9 : width > BREAK_SMALL ? 12 : 24}>
                <Card className={classes.card} title="👩‍🔬 Child Enrolled">
                    <p>
                        {appointment.child.firstName} {appointment.child.lastName}
                    </p>
                </Card>
            </Col>
            <Col span={width > BREAK_LARGE ? 6 : width > BREAK_SMALL ? 12 : 24}>
                <InvoiceDetails appointment={appointment} />
            </Col>
        </StyledRow>
    );
}

export default EnrolmentSummary
