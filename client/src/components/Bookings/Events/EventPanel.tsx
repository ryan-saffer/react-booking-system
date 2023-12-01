import dateFormat from 'dateformat'
import { Event } from 'fizz-kidz'
import React from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { ExistingEventForm } from './forms/ExistingEventForm'

const PREFIX = 'EventPanel'

const classes = {
    heading: `${PREFIX}-heading`,
    secondaryHeading: `${PREFIX}-secondaryHeading`,
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    [`& .${classes.heading}`]: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '40%',
        flexShrink: 0,
    },

    [`& .${classes.secondaryHeading}`]: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
}))

type Props = {
    event: Event
}

const EventPanel: React.FC<Props> = ({ event }) => {
    return (
        <StyledAccordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>
                    {(() => {
                        if (event.startTime.toDateString() === event.endTime.toDateString()) {
                            return `${dateFormat(event.startTime, 'h:MM TT')} - ${dateFormat(event.endTime, 'h:MM TT')}`
                        } else {
                            return `${event.startTime.toLocaleDateString('en-au', {
                                day: 'numeric',
                                month: 'numeric',
                                year: 'numeric',
                            })} - ${event.endTime.toLocaleDateString('en-au', {
                                day: 'numeric',
                                month: 'numeric',
                                year: 'numeric',
                            })}`
                        }
                    })()}
                </Typography>
                <Typography className={classes.secondaryHeading}>{event.eventName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <div style={{ margin: 16 }}>
                    <ExistingEventForm event={event} />
                </div>
            </AccordionDetails>
        </StyledAccordion>
    )
}

export default EventPanel
