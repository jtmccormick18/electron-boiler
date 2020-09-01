import React from 'react';
import {
    HashRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";



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

