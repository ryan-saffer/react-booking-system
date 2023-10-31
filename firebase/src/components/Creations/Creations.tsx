import React from 'react'
import Markdown from 'react-markdown'
import styles from './Creations.module.css'
import { creations } from './creationMarkdown'
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Toolbar, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useNavigate } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'

type Props = {}

export const CreationsPage: React.FC<Props> = () => {
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
                    {creations.map((creation, idx) => (
                        <Accordion key={idx}>
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
