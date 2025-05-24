import dateFormat from 'dateformat'
import type { Event } from 'fizz-kidz'
import React from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'

import { ExistingEventForm } from './forms/existing-event-form'

type Props = {
    event: Event
}

const EventPanel: React.FC<Props> = ({ event }) => {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                        {(() => {
                            if (event.startTime.toDateString() === event.endTime.toDateString()) {
                                return `${dateFormat(event.startTime, 'h:MM TT')} - ${dateFormat(
                                    event.endTime,
                                    'h:MM TT'
                                )}`
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
                    <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>{event.eventName}</Typography>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <ExistingEventForm event={event} />
            </AccordionDetails>
        </Accordion>
    )
}

export default EventPanel
