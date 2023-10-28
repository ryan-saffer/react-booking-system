import React from 'react'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import NavigateBefore from '@mui/icons-material/NavigateBefore'
import NavigateNext from '@mui/icons-material/NavigateNext'
import { DateTime } from 'luxon'
import { DatePicker } from '@mui/x-date-pickers'

const PREFIX = 'DateNav'

const classes = {
    main: `${PREFIX}-main`,
    heading: `${PREFIX}-heading`,
}

const Root = styled('div')({
    [`&.${classes.main}`]: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    [`& .${classes.heading}`]: {
        textAlign: 'center',
    },
})

const DateNav = ({ date, handleDateChange }: { date: DateTime; handleDateChange: (date: DateTime) => void }) => {
    return (
        <Root className={classes.main}>
            <Button onClick={() => handleDateChange(date.minus({ days: 1 }))}>
                <NavigateBefore />
            </Button>
            <DatePicker
                closeOnSelect
                value={date}
                slotProps={{
                    textField: { sx: { input: { textAlign: 'center' } }, fullWidth: true },
                    actionBar: { actions: ['today'] },
                }}
                format="ccc, LLL d, y"
            />
            <Button onClick={() => handleDateChange(date.plus({ days: 1 }))}>
                <NavigateNext />
            </Button>
        </Root>
    )
}

export default DateNav
