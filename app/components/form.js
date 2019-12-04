import React from 'react';

import { Typeahead } from 'react-bootstrap-typeahead';
import AsyncInput from './formmui.js/index.js';
import { Form, Col, Row, Container, Button } from 'react-bootstrap';

export default class AppForm extends React.Component {
    state = {
        caseSensitive: false,
        ignoreDiacritics: true,
        multiple: false,
        PID: null,
    }

    componentDidMount() {

    }

    render() {
        const { caseSensitive, ignoreDiacritics, multiple } = this.state;
        let { parcels } = this.props;
        return (<Form>
            <Form.Row>
                {/*<Typeahead
                    onChange={(selected) => {
                        this.setState({ ...selected[0] });
                    }}
                    caseSensitive={caseSensitive}
                    labelKey="PID"
                    multiple={multiple}
                    options={parcels}
                    placeholder="Enter a parcel number..."
                /> */}
                <AsyncInput />
                <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" />
                </Form.Group>

                <Form.Group id="formGridCheckbox">
                    <Form.Check type="checkbox" label="Check me out" />
                </Form.Group>
            </Form.Row>

            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form >)
    }
}


