import React from 'react';
import ReactDom from 'react-dom';
import App from './config/App';
// import { ThemeProvider } from '@material-ui/core/styles';

const theme = {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
};

//Import Styles
import 'bootstrap/dist/css/bootstrap.min.css';


//Importing TypeAhead
import 'react-bootstrap-typeahead/css/Typeahead.css';

//Importing Leaflet CSS
import 'leaflet/dist/leaflet.css';
//Main CSS file
import './styles/main.css';

import axios from 'axios';

axios.defaults.headers = {
    'Content-Type': 'application/json',
}



ReactDom.render(
    <App />,
    document.getElementById('app')
);
