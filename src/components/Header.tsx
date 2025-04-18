import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const smoothScroll = (element: HTMLElement | null) => {
    if (!element) return;
    
    const headerOffset = 40;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    const startPosition = window.pageYOffset;
    const distance = offsetPosition - startPosition;
    const duration = 500; 
    let start: number | null = null;

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Используем функцию плавности easeInOutCubic
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const topMap = document.getElementById('top-map');
      smoothScroll(topMap);
    } else {
      navigate('/');
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const topMap = document.getElementById('top-map');
      smoothScroll(topMap);
    } else {
      navigate('/');
    }
  };

  const handleEventsClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const eventsSection = document.getElementById('events-section');
      smoothScroll(eventsSection);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            component={Link} 
            to="/" 
            onClick={handleHomeClick}
            sx={{ color: 'black', textTransform: 'none' }}
          >
            Главная
          </Button>
          <Button 
            component={Link} 
            to="/" 
            onClick={handleEventsClick}
            sx={{ color: 'black', textTransform: 'none' }}
          >
            Мероприятия
          </Button>
        </Box>
        
        <Box 
          sx={{ 
            position: 'absolute', 
            left: '50%', 
            transform: 'translateX(-50%)',
            cursor: 'pointer'
          }}
          onClick={handleLogoClick}
        >
          <img 
            src={logo} 
            alt="EventFlow Logo" 
            style={{ height: '40px' }} 
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            component={Link} 
            to="/profile/organizer" 
            sx={{ color: 'black', textTransform: 'none' }}
          >
            Профиль
          </Button>
          <Button 
            component={Link} 
            to="/login" 
            sx={{ color: 'black', textTransform: 'none' }}
          >
            Войти
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 