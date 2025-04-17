import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Box } from '@mui/material';

const AuthButtons: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        component={Link}
        to="/login"
        variant="contained"
        color="inherit"
        sx={{ 
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Войти
      </Button>
      <Button
        component={Link}
        to="/register"
        variant="contained"
        color="secondary"
      >
        Регистрация
      </Button>
    </Box>
  );
};

export default AuthButtons; 