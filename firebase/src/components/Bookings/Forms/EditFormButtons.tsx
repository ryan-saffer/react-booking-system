import React from 'react'
import { styled } from '@mui/material/styles'
import { Button, CircularProgress, Fab } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import CheckIcon from '@mui/icons-material/Check'
import CreateIcon from '@mui/icons-material/Create'
import DeleteIcon from '@mui/icons-material/Delete'
import { green, red } from '@mui/material/colors'
import { useScopes } from '../../Hooks/UseScopes'

const PREFIX = 'EditFormButtons'

const classes = {
    saveButtonDiv: `${PREFIX}-saveButtonDiv`,
    saveButton: `${PREFIX}-saveButton`,
    deleteButton: `${PREFIX}-deleteButton`,
    progress: `${PREFIX}-progress`,
    success: `${PREFIX}-success`,
    editButton: `${PREFIX}-editButton`,
    cancelButton: `${PREFIX}-cancelButton`,
}

const Root = styled('div')(({ theme }) => ({
    [`&.${classes.saveButtonDiv}`]: {
        display: 'flex',
        justifyContent: 'flex-end',
    },

    [`& .${classes.saveButton}`]: {
        marginTop: theme.spacing(3),
    },

    [`& .${classes.deleteButton}`]: {
        marginTop: theme.spacing(3),
        marginRight: theme.spacing(3),
        '&:hover': {
            backgroundColor: red[800],
        },
    },

    [`& .${classes.progress}`]: {
        color: green[500],
        position: 'absolute',
        marginTop: '18px',
        marginRight: '-6px',
    },

    [`& .${classes.success}`]: {
        marginTop: theme.spacing(3),
        backgroundColor: green[500],
    },

    [`& .${classes.editButton}`]: {
        marginTop: theme.spacing(3),
    },

    [`& .${classes.cancelButton}`]: {
        marginTop: theme.spacing(3),
        marginRight: theme.spacing(3),
    },
}))

type Props = {
    loading: boolean
    editing: boolean
    success: boolean
    onStartEditing: () => void
    onCancelEditing: () => void
    onSave: () => void
    onDelete: () => void
}

const EditFormButtons: React.FC<Props> = ({
    loading,
    editing,
    success,
    onStartEditing,
    onCancelEditing,
    onSave,
    onDelete,
}) => {
    const canEdit = useScopes().CORE === 'write'

    if (canEdit) {
        if (success) {
            return (
                <Root className={classes.saveButtonDiv}>
                    <Fab
                        className={classes.success}
                        aria-label="save"
                        color="secondary"
                        type="submit"
                        disabled={loading}
                    >
                        {<CheckIcon />}
                    </Fab>
                </Root>
            )
        }
        return (
            <Root className={classes.saveButtonDiv}>
                {!loading && !editing && (
                    <Fab className={classes.deleteButton} aria-label="delete" color="primary" onClick={onDelete}>
                        <DeleteIcon />
                    </Fab>
                )}
                {editing ? (
                    <>
                        <Button
                            className={classes.cancelButton}
                            variant="outlined"
                            onClick={onCancelEditing}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Fab
                            className={classes.saveButton}
                            aria-label="save"
                            color="secondary"
                            type="submit"
                            disabled={loading}
                            onClick={onSave}
                        >
                            {<SaveIcon />}
                        </Fab>
                    </>
                ) : (
                    <Fab
                        className={classes.editButton}
                        aria-label="edit"
                        color="secondary"
                        type="submit"
                        disabled={loading}
                        onClick={onStartEditing}
                    >
                        <CreateIcon />
                    </Fab>
                )}
                {loading && <CircularProgress size={68} className={classes.progress} />}
            </Root>
        )
    } else {
        return null
    }
}

export default EditFormButtons
