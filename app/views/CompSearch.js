
import React from 'react';

import { Row, Col, Jumbotron, Container, Form } from 'react-bootstrap';

import { Button, FormGroup, Checkbox, FormControlLabel, Typography, CircularProgress } from '@material-ui/core'

import { Typeahead } from 'react-bootstrap-typeahead';
import Modal from '../components/helpers/modal';

import Map from './map';

// import AsyncForm from '../components/asyncform';

// import Form from '../components/form';
import ParcelCard from '../components/parcelcards';
import ParcelPanel from '../components/parcelpanels';
import AsyncInput from '../components/formmui';

import * as $ from 'axios';



import 'react-bootstrap-typeahead/css/Typeahead.css';

import fileExists from 'file-exists';

import { makeStyles } from '@material-ui/core/styles';

import PublishIcon from '@material-ui/icons/Publish';


import * as path from 'path';
import shapefile from 'shapefile';
const key = '335d0b6704d241caa075d6262b45c27a';



const useStyles = makeStyles(theme => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    input: {
        display: 'none',
    },
}));


const FileUpload = function (props) {
    const classes = useStyles();
    return (<div className={classes.form}>
        <input
            accept=".zip"
            className={classes.input}
            id="shp-file"
            name="shp-file"
            type="file"
            onChange={props.onChange}
        />
        <label htmlFor="shp-file">
            <Button variant="contained" color="primary" component="span">
                Upload
            </Button>
        </label>

    </div>)
}
const FileQueue = (props) => {
    return (<div>
        <Typography style={{ color: 'black' }}>{props.name} <span><PublishIcon /></span></Typography>
        <Button variant="contained" onClick={props.onClick}>Upload</Button>
    </div>)
}


const checkboxes = [
    {
        title: 'Match story heights',
        name: 'story_match',
    },
    {
        title: 'Match Basement Finish',
        name: 'basement_match'
    },
    {
        title: 'Subdivision Sales Only',
        name: 'subd_only'
    }
]


export default class CompSearch extends React.Component {

    state = {
        comps: [],
        caseSensitive: false,
        ignoreDiacritics: true,
        multiple: false,
        story_match: false,
        basement_match: false,
        subd_only: false,
        parcels: null,
        hasLayer: null,
        selectedFile: null,
        modal: false
    }

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }
    componentDidMount=()=> {
        $.get('/api/map-data')
            .then(data => {
                console.log('data', data)
                if (data.status !== 404)
                    this.setState({
                        hasLayer: true,
                    })
            })
            .catch(err => {
                console.log({ err })
                this.setState({
                    hasLayer: false
                })
            })
    }
    getComps = (event) => {
        event.preventDefault();
        if (this.state.subject) {
            $.get(`/api/comps-for/${this.state.subject}`)
                .then(comps => {
                    return this.setState({
                        comps: comps.data.comparables
                    })
                })
                .catch(err => {
                    return console.log({ err })
                })
        }
        else return;

    }
    getParcels = () => {
        if (!this.state.hasLayer) {
            $.get('/api/pins')
                .then(parcels => {
                    return parcels.data[0]
                })
                .catch(err => {
                    { err }
                })
        }
        else {
            $.get('/api/pins/gis')
                .then(parcels => {
                    console.log('par', parcels)
                    return parcels.data[0]
                })
                .catch(err => {
                    { err }
                })
        }
    }
    fileUpload = (event) => {
        console.log(event.target.files)
        this.setState({
            selectedFile: event.target.files[0],
            loaded: 0
        })
    }
    fileImport = (event) => {
        const data = new FormData();
        data.append('file', this.state.selectedFile);
        this.setState({
            loaded: 0,
            modal: true
        });
        $.post('/upload/gis-upload', data, {
            'content-type': 'multipart/form-data'
        }).then(res => {
            console.log(res);
            return this.setState({
                modal: false,
                hasLayer: true
            })
        }).catch(err => {
            return console.log({ err })
        })

    }



    render() {
        const { caseSensitive, ignoreDiacritics, multiple, parcels, REALKEY, comps } = this.state;
        console.log(this.state)
        return (<Container fluid className="mt-5 p-5">
            <Row className="text-center m-2">
                <Col md={12}>
                    <Form>
                        <Row>
                            <Col md={4}>

                                <AsyncInput name="subject" onChange={(e, subject) => {
                                    this.setState({
                                        subject
                                    })
                                }} hasLayer={this.state.hasLayer}/>

                            </Col>

                            <Col md={8}>
                                <FormGroup row>
                                    {checkboxes.map(box => (
                                        <div key={box.name}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox name={box.name} value={box.name} checked={this.state[box.name]} onChange={(e, isChecked, val) => {
                                                        console.log(e);
                                                        this.setState({
                                                            [e.target.name]: e.target.checked
                                                        })
                                                    }}
                                                    />
                                                }
                                                label={box.title}
                                            />
                                        </div>
                                    ))}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Button className="m-3" onClick={this.getComps}>
                                Submit
                                </Button>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row style={{ maxHeight: 400 }}>
                <Col md={8}>
                    {!this.state.hasLayer ? (<Row className="text-center justify-content-center">
                        <Col>
                            {!this.state.selectedFile || !this.state.selectedFile.name ? <FileUpload onChange={this.fileUpload} /> : <FileQueue name={this.state.selectedFile.name} onClick={this.fileImport} />}
                        </Col>
                    </Row>) : (<div>
                        {comps && comps.length > 1 && <Map comps={comps} />}
                    </div>)}


                </Col>
                <Col md={4} style={{ overflowY: 'scroll' }}>
                    {Array.isArray(comps) && comps.length > 1 && comps.map((parcel, key) => (<ParcelPanel key={parcel.PID || key} {...parcel} />))}
                </Col>

            </Row>
            <Modal open={this.state.modal} loading title={'Uploading Parcel Layer...'} message={'This may take a while. Please be patient and do not refresh the page.'} />
        </Container >)
    }
}