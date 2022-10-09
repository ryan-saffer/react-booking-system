import React from 'react'
import { IconButton, makeStyles } from '@material-ui/core'
import LanguageIcon from '@material-ui/icons/Language'
import InstagramIcon from '@material-ui/icons/Instagram'

const Footer = () => {
    const classes = useStyles()

    return (
        <div className={classes.footer}>
            <IconButton onClick={() => (window.location.href = 'https://www.fizzkidz.com.au')}>
                <LanguageIcon />
            </IconButton>
            <IconButton onClick={() => (window.location.href = 'https://www.instagram.com/fizzkidzz')}>
                <InstagramIcon />
            </IconButton>
        </div>
    )
}

const useStyles = makeStyles({
    footer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        height: '6rem',
        backgroundColor: 'aliceblue',
        '& svg': {
            width: 40,
            height: 40,
            padding: 30,
            '&:hover': {
                color: 'green',
            },
        },
    },
})

export default Footer
