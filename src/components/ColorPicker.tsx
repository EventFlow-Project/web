import React from 'react';
import { Box, TextField, Popover } from '@mui/material';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  anchorEl,
  onClose,
  color,
  onChange,
}) => {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          p: 2,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }
      }}
    >
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 1
      }}>
        <HexColorPicker
          color={color}
          onChange={onChange}
          style={{
            width: '200px',
            height: '200px',
          }}
        />
        <Box sx={{ 
          width: '100%', 
          height: '20px', 
          backgroundColor: color,
          borderRadius: '4px',
          border: '1px solid rgba(0,0,0,0.1)'
        }} />
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1,
          width: '100%'
        }}>
          <TextField
            size="small"
            label="HEX"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            inputProps={{
              maxLength: 7,
              pattern: '^#[0-9A-Fa-f]{6}$'
            }}
          />
          <TextField
            size="small"
            label="RGB"
            value={(() => {
              const r = parseInt(color.slice(1, 3), 16);
              const g = parseInt(color.slice(3, 5), 16);
              const b = parseInt(color.slice(5, 7), 16);
              return `rgb(${r}, ${g}, ${b})`;
            })()}
            InputProps={{
              readOnly: true,
            }}
          />
        </Box>
      </Box>
    </Popover>
  );
};

export default ColorPicker; 