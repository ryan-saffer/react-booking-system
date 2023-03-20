import React from 'react'
import { Button, CircularProgress, Fab, makeStyles } from '@material-ui/core'
import useRole from '../../Hooks/UseRole'
import { Roles } from '../../../constants/roles'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import CreateIcon from '@material-ui/icons/Create'
import DeleteIcon from '@material-ui/icons/Delete'
import { green, red } from '@material-ui/core/colors'

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
    const classes = useStyles()
    const isAdmin = useRole() === Roles.ADMIN

    if (isAdmin) {
        return (
            <div className={classes.saveButtonDiv}>
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
                            className={success ? classes.success : classes.saveButton}
                            aria-label="save"
                            color="secondary"
                            type="submit"
                            disabled={loading}
                            onClick={onSave}
                        >
                            {success ? <CheckIcon /> : <SaveIcon />}
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
                        {<CreateIcon />}
                    </Fab>
                )}
                {loading && <CircularProgress size={68} className={classes.progress} />}
            </div>
        )
    } else {
        return null
    }
}

const useStyles = makeStyles((theme) => ({
    saveButtonDiv: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    saveButton: {
        marginTop: theme.spacing(3),
    },
    deleteButton: {
        marginTop: theme.spacing(3),
        marginRight: theme.spacing(3),
        '&:hover': {
            backgroundColor: red[800],
        },
    },
    progress: {
        color: green[500],
        position: 'absolute',
        marginTop: '18px',
        marginRight: '-6px',
    },
    success: {
        marginTop: theme.spacing(3),
        backgroundColor: green[500],
    },
    editButton: {
        marginTop: theme.spacing(3),
    },
    cancelButton: {
        marginTop: theme.spacing(3),
        marginRight: theme.spacing(3),
    },
}))

export default EditFormButtons
