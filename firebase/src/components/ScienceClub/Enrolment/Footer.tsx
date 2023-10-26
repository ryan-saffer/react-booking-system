import React from 'react'
import { styled } from '@mui/material/styles'
import { IconButton } from '@mui/material'
import LanguageIcon from '@mui/icons-material/Language'
import InstagramIcon from '@mui/icons-material/Instagram'

const PREFIX = 'Footer'

const classes = {
    footer: `${PREFIX}-footer`,
}

const Root = styled('div')({
    [`&.${classes.footer}`]: {
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

const Footer = () => {
    return (
        <Root className={classes.footer}>
            <IconButton onClick={() => (window.location.href = 'https://www.fizzkidz.com.au')} size="large">
                <LanguageIcon />
            </IconButton>
            <IconButton onClick={() => (window.location.href = 'https://www.instagram.com/fizzkidzz')} size="large">
                <InstagramIcon />
            </IconButton>
        </Root>
    )
}

export default Footer
