import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        '& > * + *': {
            marginLeft: theme.spacing(2),
        },
    },
}));

export default function LoadingSpinner(props) {
    const classes = useStyles();
    const { progress } = props;
    console.log(progress || 'No Progress');
    return (
        <div className={classes.root}>
            {!progress ? (
                <CircularProgress />
            ) : (
                    <CircularProgress variant="determinate" value={progress} color="secondary" />
                )}
        </div>
    );
}