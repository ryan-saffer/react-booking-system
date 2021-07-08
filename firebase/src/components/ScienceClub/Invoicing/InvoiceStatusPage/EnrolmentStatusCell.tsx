import React from 'react'
import { Acuity } from 'fizz-kidz'
import { makeStyles, TableCell } from '@material-ui/core'

interface EnrolementStatusCellProps {
    status: Acuity.Client.ContinuingOption
}

const EnrolmentStatusCell: React.FC<EnrolementStatusCellProps> = ({ status }) => {

    const classes = useStyles()

    switch (status) {
        case 'yes':
            return (
                <TableCell className={classes.enrolled} size="small">
                    Enrolled
                </TableCell>
            )
        case 'no':
            return (
                <TableCell className={classes.unenrolled} size="small">
                    NOT CONTINUING
                </TableCell>
            )
        default:
            return (
                <TableCell className={classes.freeTrial} size="small">
                    FREE TRIAL
                </TableCell>
            )
    }
}

const useStyles = makeStyles({
    enrolled: {
        backgroundColor: '#78d462'
    },
    unenrolled: {
        backgroundColor: '#ff8c8c'
    },
    freeTrial: {
        backgroundColor: '#ff9800'
    }
})

export default EnrolmentStatusCell