
import React, { Fragment } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import fileExists from 'file-exists';
import { Row, Col, Container } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography, CircularProgress } from '@material-ui/core';
import PublishIcon from '@material-ui/icons/Publish';
import Modal from '../components/helpers/modal';
import * as axios from 'axios';
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





const MyPopupMarker = ({ content, position }) => (
    <Marker position={position || [34.298, -83.825]}>
        <Popup>{content || "Dummy Data"}</Popup>
    </Marker>
)

const MyMarkersList = ({ markers }) => {
    const items = markers.map(({ key, ...props }) => (
        <MyPopupMarker key={key} {...props} />
    ))
    return <Fragment>{items}</Fragment>
}


export default class CustomComponent extends React.Component {
    state = {
        comps:this.props.comps || [],
        markers: [],
        hasLayer: null,
        selectedFile: null,
        modal: false
    }
    componentDidMount() {
        if (this.state.comps && this.state.comps.length > 0) {
            let compQuery='';
            this.state.comps.forEach(comp=>{
                compQuery += comp.PID +','
            })
            console.log('query',compQuery);
            const url=`/api/map-data?comps=${compQuery}`
            console.log('url',url);
            axios.get(url)
                .then(coords => {
                    console.log('coords', coords)
                    if (data.status !== 404)
                        this.setState({
                            hasLayer: true,
                            markers:coords.data
                        })
                })
                .catch(err => {
                    console.log({ err })
                    this.setState({
                        hasLayer: false
                    })
                })
        } else{
             axios.get('/api/map-data')
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
        axios.post('/upload/gis-upload', data, {
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
        console.log(this.state)
        this.state.selectedFile && console.log(this.state.selectedFile)
        console.log('map', this.props);
        const { comps } = this.props;
        return (<div>
                <Map center={[34.298, -83.825]} zoom={13}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MyMarkersList markers={this.state.markers} />
                </Map>
        </div>

        )
    }
}


