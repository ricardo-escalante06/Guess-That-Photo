import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function BasicSelect({ value, onChange }) {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Select a category!</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          label="Select a category!"
          onChange={handleChange}
          sx={{
            color: 'white',
            '.MuiSelect-icon': { color: 'white' },
          }}
        >
          <MenuItem value="Parades">Parades</MenuItem>
          <MenuItem value="Selfies">Selfies</MenuItem>
          <MenuItem value="Parks">Parks</MenuItem>

        </Select>
      </FormControl>
    </Box>
  );
}

