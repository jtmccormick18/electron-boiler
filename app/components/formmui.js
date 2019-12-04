import React from 'react';
require('babel-polyfill');
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';





export default function Asynchronous(props) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const loading = open && options.length === 0;

  // const handleChange = (event,value) => {
  //   console.log(event,value)
  //   setInputValue(event.target.value);
  // };

  React.useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      const response = props.hasLayer ? await axios.get('/api/pins/gis') : await axios.get('/api/pins');
      console.log('gis', response)
      const parcels = props.hasLayer ? response.data.parcels:response.data[0];
      if (active) {
        props.hasLayer ? setOptions(parcels.map(parcel=>parcel)):setOptions(Object.keys(parcels).map(key => parcels[key].PID));
        
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      id="asynchronous-demo"
      style={{ width: '100%' }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      onChange={props.onChange}
      getOptionLabel={option => option}
      options={options}
      loading={loading}
      renderInput={params => (
        <TextField
          {...params}
          label="Search by Parcel ID"
          fullWidth
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}