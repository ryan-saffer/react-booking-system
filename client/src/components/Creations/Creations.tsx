import Markdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'

import * as ROUTES from '@constants/routes'
import * as Logo from '@drawables/FizzKidzLogoHorizontal.png'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Toolbar, Typography } from '@mui/material'

import styles from './Creations.module.css'
import { creations, taylorSwift } from './creationMarkdown'

export const CreationsPage = () => {
    const navigate = useNavigate()

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h5" color="inherit">
                        Creation Instructions
                    </Typography>
                    <img
                        src={Logo.default}
                        onClick={() => navigate(ROUTES.LANDING)}
                        alt="Fizz Kidz Logo"
                        className={styles.logo}
                    />
                </Toolbar>
            </AppBar>
            <div className={styles.root}>
                <div className={styles.main}>
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
            </div>
        </>
    )
}
