import React, { useState, useEffect } from 'react';
import { Event } from '../types/Event';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Box,
  CardMedia,
  IconButton,
  keyframes
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { DefaultTag, defaultTagColors, CustomTag, DEFAULT_CUSTOM_TAG_COLOR } from '../types/Tag';

// Настройки эффекта волны
const WAVE_DURATION = 0.9; // Длительность анимации в секундах
const WAVE_COLOR = '#ff4081'; // Цвет волны
const WAVE_OPACITY = 0.3; // Начальная прозрачность волны

// Анимация волны
const rippleKeyframes = keyframes`
  0% {
    transform: scale(1);
    border-color: ${WAVE_COLOR};
    border-width: 0;
    opacity: 0;
  }
  50% {
    opacity: ${WAVE_OPACITY};
    border-width: 3px;
  }
  100% {
    transform: scale(1.1);
    border-color: ${WAVE_COLOR};
    border-width: 0;
    opacity: 0;
  }
`;


interface EventListProps {
  events: Event[];
}

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [backImage, setBackImage] = useState<HTMLImageElement | null>(null);

  // Предзагрузка изображения для задней стороны
  useEffect(() => {
    const img = new Image();
    img.src = event.location.image || 'https://via.placeholder.com/300x400';
    img.onload = () => {
      setBackImage(img);
    };
  }, [event.location.image]);

  const getTagColor = (tag: DefaultTag | CustomTag) => {
    if (typeof tag === 'string') {
      return defaultTagColors[tag];
    }
    return tag.color || DEFAULT_CUSTOM_TAG_COLOR;
  };

  const getTagLabel = (tag: DefaultTag | CustomTag) => {
    if (typeof tag === 'string') {
      return tag;
    }
    return tag.name;
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const triggerRippleEffect = () => {
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), WAVE_DURATION * 1000);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 300) {
      handleFavoriteToggle();
      triggerRippleEffect();
    }
    setLastClickTime(currentTime);
  };

  const handleIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleFavoriteToggle();
    triggerRippleEffect();
  };

  return (
    <Box 
      sx={{ 
        width: '400px', 
        margin: '0 auto',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        '&:hover': {
          '& .event-card': {
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
          }
        }
      }}
      onClick={handleCardClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Эффект волны */}
      {showRipple && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px solid transparent',
              borderRadius: '16px',
              animation: `${rippleKeyframes} ${WAVE_DURATION}s ease-out`,
              animationDelay: '0s',
              pointerEvents: 'none',
              zIndex: 2
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px solid transparent',
              borderRadius: '16px',
              animation: `${rippleKeyframes} ${WAVE_DURATION}s ease-out`,
              animationDelay: '0.2s',
              pointerEvents: 'none',
              zIndex: 2
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px solid transparent',
              borderRadius: '16px',
              animation: `${rippleKeyframes} ${WAVE_DURATION}s ease-out`,
              animationDelay: '0.4s',
              pointerEvents: 'none',
              zIndex: 2
            }}
          />
        </>
      )}

      <Box
        sx={{
          perspective: '2000px',
          height: '650px',
          cursor: 'pointer',
          transformStyle: 'preserve-3d',
          userSelect: 'none',
          '& .flip-card-inner': {
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }
        }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <Box className="flip-card-inner">
          {/* Front of the card */}
          <Card
            className="event-card front"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'box-shadow 0.3s ease-in-out',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: 'white',
              transform: 'rotateY(0deg)',
              userSelect: 'none'
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="300"
                image={event.image || 'https://via.placeholder.com/300x200'}
                sx={{ 
                  borderRadius: '16px'
                }}
              />
              {isFavorite && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <FavoriteIcon color="error" />
                </Box>
              )}
            </Box>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                {event.tags.map((tag, index) => {
                  const color = getTagColor(tag);
                  return (
                    <Chip 
                      key={index} 
                      label={getTagLabel(tag)}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        mr: 0.5, 
                        mb: 0.5,
                        border: 'none',
                        color: color,
                        fontSize: '17px', 
                      }}
                    />
                  );
                })}
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '30px' }}>
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {event.description}
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Typography variant="body2">
                  <strong>Организатор:</strong> {event.organizer}
                </Typography>
                <Typography variant="body2">
                  <strong>Место:</strong> {event.location.address}
                </Typography>
                <Typography variant="body2">
                  <strong>Дата:</strong> {event.date}
                </Typography>
                <Typography variant="body2">
                  <strong>Продолжительность:</strong> {event.duration}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Back of the card */}
          <Card
            className="event-card back"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'box-shadow 0.3s ease-in-out',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: 'white',
              transform: 'rotateY(180deg)',
              '-webkit-transform-style': 'preserve-3d'
            }}
          >
            <Box 
              sx={{ 
                position: 'relative', 
                height: '100%',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${event.location.image || 'https://via.placeholder.com/300x400'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '16px',
                  visibility: backImage ? 'visible' : 'hidden'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                  padding: '20px',
                  color: 'white',
                  borderBottomLeftRadius: '16px',
                  borderBottomRightRadius: '16px',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {event.location.address}
                </Typography>
                <Typography variant="body2">
                  Дата: {event.date}
                </Typography>
                <Typography variant="body2">
                  Продолжительность: {event.duration}
                </Typography>
              </Box>
              <IconButton
                onClick={handleIconClick}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease-in-out',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                {isFavorite ? (
                  <FavoriteIcon color="error" />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

const EventList: React.FC<EventListProps> = ({ events }) => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '48px',
      paddingTop: '15px',
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 2
    }}>
      {events.map((event) => (
        <div key={event.id}>
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
};

export default EventList; 