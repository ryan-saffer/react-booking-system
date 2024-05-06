import Markdown from 'react-markdown'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'

import styles from './Creations.module.css'
import { creations, taylorSwift } from './creationMarkdown'

export const CreationsPage = () => {
    return (
        <div className="h-full bg-slate-100 p-6">
            <h1 className="lilita m-0 mb-8 text-3xl">Creation Instructions</h1>
            <Accordion TransitionProps={{ unmountOnExit: true }} className="mb-8">
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600}>Taylor Swift 'Swiftie' Parties</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Markdown className={styles.markdown}>{taylorSwift}</Markdown>
                </AccordionDetails>
            </Accordion>
            {creations.map((creation, idx) => (
                <Accordion key={idx} TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight={600}>{creation.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Markdown className={styles.markdown}>{creation.markdown}</Markdown>
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    )
}
