import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';

const Input = styled(MuiInput)`
  width: 42px;
`;

export default function InputSlider({ value, onChange }) {
  const handleSliderChange = (event, newValue) => {
    onChange(newValue);
  };

  const handleInputChange = (event) => {
    onChange(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 1940) {
      onChange(1940);
    } else if (value > 2025) {
      onChange(2025);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500, margin: 'auto' }}>
      <Typography id="input-slider" gutterBottom>
        What year?
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Slider
            sx={{ width: '100%' }}
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            min={1940}
            max={2025}
            step={1}
          />
        </Box>
        <Box>
          <Input
            sx={{ color: 'white', width: '60px' }}
            value={value === '' ? '' : value}
            size="large"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 1,
              min: 1940,
              max: 2025,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
