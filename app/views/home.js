import React, { Component } from 'react';
import Api from '../helpers/api';

import { Jumbotron, Container, Row, Col } from 'react-bootstrap';
import ParcelCard from '../components/parcelcards';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };

        this.handleInput = this.handleInput.bind(this);
    }

    componentDidMount() {
    }

    handleInput(e) {
        this.setState({ name: e.target.value });
    }



    render() {
        const { name } = this.state;

        return (<div></div>)
    }
}

export default Home;
