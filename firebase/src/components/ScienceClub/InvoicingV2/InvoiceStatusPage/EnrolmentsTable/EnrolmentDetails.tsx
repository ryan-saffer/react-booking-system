import React from 'react'
import { ScienceEnrolment } from 'fizz-kidz'
import { Descriptions } from 'antd'
import { Description } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core'

type Props = {
    enrolment: ScienceEnrolment
}

const EnrolmentDetails: React.FC<Props> = ({ enrolment }) => {
    const classes = useStyles()

    return (
        <Descriptions className={classes.description} bordered size="small" column={1}>
            <Descriptions.Item label="Parent Phone">{enrolment.parent.phone}</Descriptions.Item>
            <Descriptions.Item label="Parent Email">{enrolment.parent.email}</Descriptions.Item>
            <Descriptions.Item label="Child Name">
                {enrolment.child.firstName} {enrolment.child.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Child Grade">{enrolment.child.grade}</Descriptions.Item>
            <Descriptions.Item label="Child Age">{enrolment.child.age}</Descriptions.Item>
        </Descriptions>
    )
}

const useStyles = makeStyles({
    description: {
        '& th': {
            backgroundColor: '#f7f7f7f7 !important',
            fontWeight: 500,
        },
    },
})

export default EnrolmentDetails
