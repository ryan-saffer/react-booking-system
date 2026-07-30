import { CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'

const PREFIX = 'Loading'

const classes = {
    root: `${PREFIX}-root`,
}

const Root = styled('div')({
    [`&.${classes.root}`]: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 24,
    },
})

const Loading = () => {
    return (
        <Root className={classes.root}>
            <CircularProgress />
        </Root>
    )
}

export default Loading
