import React from 'react';
import {
    HashRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';


import CompSearch from '../views/CompSearch'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee, faHome } from '@fortawesome/free-solid-svg-icons'
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import MapIcon from '@material-ui/icons/Map';
import HomeIcon from '@material-ui/icons/Home';
import SideNav from '../nav/SideNav';

import Home from '../views/home';
import About from '../views/about';


const nav = {
    title: 'McCormick',
    logo: {
        path: '/logo.png',
        alt: 'McCormick'
    },
    links: [
        {
            name: 'Home',
            icon: 'home',
            url: '/comper'
        },
        {
            name: 'Map',
            icon: 'map',
            url: '/map'
        }
    ]
}

const classes = {
    root: {
        display: 'flex',
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 3
    },
    content: {
        flexGrow: 1,
        padding: 10,
    },
};



export default class App extends React.Component {

    render() {

        return (

            <Router>
                <div style={classes.root}>

                    <SideNav {...nav} />
                    <div style={classes.toolbar} />

                    <main style={classes.content}>



                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route path="/comper" render={() => <CompSearch />} />
                            {/* <Route path="/comper" component={CompSearch} /> */}
                        </Switch>



                    </main>
                </div>
            </Router>


        )
    }

}

