import Markdown from 'react-markdown'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'

import styles from './Creations.module.css'
import { creations } from './creationMarkdown'

export const CreationsPage = () => {
    return (
        <div className="bg-slate-200/50 p-6">
            <h1 className="lilita m-0 pb-4 text-2xl">Creation Instructions</h1>
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
