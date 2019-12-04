import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

import LoadingSpinner from './loading';

const useStyles = makeStyles(theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

export default function TransitionsModal(props) {
    const classes = useStyles();
    const { open, title, message, loading } = props;

    return (<Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className={classes.modal}
        open={open}
        // onClose={handleClose}
        // closeAfterTransition
        BackdropComponent={Backdrop}
    // BackdropProps={{
    //     timeout: 500,
    // }}
    >
        <Fade in={open}>
            <div className={classes.paper}>
                <h2 id="modal-title">{title || "Loading"}</h2>
                <p id="modal-description">{message || "Please Wait"}</p>
                {loading && <LoadingSpinner />}
            </div>
        </Fade>
    </Modal>

    );
}