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
  keyframes,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import { DefaultTag, defaultTagColors, CustomTag, DEFAULT_CUSTOM_TAG_COLOR } from '../types/Tag';
import { Friend } from '../types/User';
import { userService } from '../services/userService';
import { authService } from '../services/authService';


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


export const EventCard: React.FC<{ 
  event: Event;
  isInvitation?: boolean;
  onAcceptInvitation?: (eventId: string) => void;
  onDeclineInvitation?: (eventId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
  friends?: Friend[];
  onInviteFriend?: (eventId: string, friendId: string) => void;
}> = ({ 
  event,
  isInvitation,
  onAcceptInvitation,
  onDeclineInvitation,
  isFavorite = false,
  onToggleFavorite,
  friends = [],
  onInviteFriend
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showRipple, setShowRipple] = useState(false);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [frontImage, setFrontImage] = useState<string>(event.image || 'https://via.placeholder.com/300x200');
    const [backImage, setBackImage] = useState<string>(event.location.image || 'https://via.placeholder.com/300x400');
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>(friends);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isAuthenticated = authService.isAuthenticated();
  
    useEffect(() => {
      setImagesLoaded(false);
      
      const loadImages = async () => {
        try {
          const frontImg = new Image();
          const backImg = new Image();
          
          const frontLoadPromise = new Promise((resolve) => {
            frontImg.onload = resolve;
            frontImg.src = event.image || 'https://via.placeholder.com/300x200';
          });
          
          const backLoadPromise = new Promise((resolve) => {
            backImg.onload = resolve;
            backImg.src = event.location.image || 'https://via.placeholder.com/300x400';
          });
          
          await Promise.all([frontLoadPromise, backLoadPromise]);
          
          setFrontImage(event.image || 'https://via.placeholder.com/300x200');
          setBackImage(event.location.image || 'https://via.placeholder.com/300x400');
          setImagesLoaded(true);
        } catch (error) {
          console.error('Error loading images:', error);
          setImagesLoaded(true);
        }
      };
      
      loadImages();
    }, [event.image, event.location.image]);
  
    useEffect(() => {
      setFilteredFriends(
        friends.filter(friend =>
          friend.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }, [searchTerm, friends]);
  
    useEffect(() => {
      const checkRegistrationStatus = async () => {
        try {
          const status = await userService.getEventRegistrationStatus(event.id);
          setIsRegistered(status);
        } catch (error) {
          console.error('Ошибка при проверке статуса записи:', error);
        }
      };

      checkRegistrationStatus();
    }, [event.id]);
  
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
  
    const handleFavoriteToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isAuthenticated) return;
      onToggleFavorite?.(event.id);
    };
  
    const triggerRippleEffect = () => {
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), WAVE_DURATION * 1000);
    };
  
    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const currentTime = new Date().getTime();
      if (currentTime - lastClickTime < 300) {
        handleFavoriteToggle(e);
        triggerRippleEffect();
      }
      setLastClickTime(currentTime);
    };
  
    const handleInviteFriend = (friendId: string) => {
      if (!isAuthenticated) return;
      onInviteFriend?.(event.id, friendId);
      setIsInviteDialogOpen(false);
    };
  
    const handleRegistration = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        if (isRegistered) {
          await userService.cancelEventRegistration(event.id);
          setIsRegistered(false);
        } else {
          await userService.signUpForEvent(event.id);
          setIsRegistered(true);
        }
      } catch (error) {
        console.error('Ошибка при обновлении статуса записи:', error);
      } finally {
        setIsLoading(false);
      }
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
          opacity: imagesLoaded ? 1 : 0.7,
          transition: 'opacity 0.3s ease-in-out',
          '&:hover': {
            '& .event-card': {
              boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
            }
          }
        }}
        onClick={handleCardClick}
        onMouseDown={(e) => e.preventDefault()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              transformStyle: 'preserve-3d',
              transform: isHovered ? 'rotateY(180deg)' : 'rotateY(0deg)',
              willChange: 'transform'
            }
          }}
        >
          <Box className="flip-card-inner">
            {/* Передняя сторона карточки */}
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
                userSelect: 'none',
                willChange: 'transform'
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={frontImage}
                  sx={{ 
                    borderRadius: '16px',
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: imagesLoaded ? 1 : 0.7
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    fontSize: 20,
                    color: 'rgb(255, 185, 55)',
                    fontWeight: 'bold',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '10px',
                    width: 120,
                    height: 35,
                  }}>
                    {event.status}
                </Box>
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
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%'
              }}>
                {/* Теги */}
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
                          mb: 0.2,
                          border: 'none',
                          color: color,
                          fontSize: '16px',
                          fontWeight: 500,
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
                
                <Box sx={{ 
                  marginTop: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  position: 'relative',
                  bottom: 0,
                  width: '100%'
                }}>
                  {/* Длительность и организатор */}
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'text.secondary',
                    fontSize: '13px'
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'inherit',
                        fontSize: 'inherit'
                      }}
                    >
                      {event.duration}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'inherit',
                        fontSize: 'inherit',
                        fontStyle: 'italic'
                      }}
                    >
                      {event.organizer}
                    </Typography>
                  </Box>
                  {/* Адрес и дата */}
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'text.secondary',
                    fontSize: '13px',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    pt: 1
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'inherit',
                        fontSize: 'inherit'
                      }}
                    >
                      {event.location.address}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'inherit',
                        fontSize: 'inherit'
                      }}
                    >
                      {event.date}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
  
            {/* Задняя сторона карточки */}
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
                userSelect: 'none',
                willChange: 'transform'
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
                    backgroundImage: `url(${backImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '16px',
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: imagesLoaded ? 1 : 0.7
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
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {isInvitation ? (
                      <>
                        <Tooltip title={!isAuthenticated ? "Для взаимодействия необходимо авторизоваться" : ""}>
                          <span>
                            <Button
                              variant="outlined"
                              startIcon={<CheckIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isAuthenticated) return;
                                onAcceptInvitation?.(event.id);
                              }}
                              disabled={!isAuthenticated}
                              sx={{
                                flex: 1,
                                color: 'white',
                                borderColor: 'white',
                                '&:hover': {
                                  borderColor: 'white',
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                              }}
                            >
                              Принять
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip title={!isAuthenticated ? "Для взаимодействия необходимо авторизоваться" : ""}>
                          <span>
                            <Button
                              variant="outlined"
                              startIcon={<CloseIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isAuthenticated) return;
                                onDeclineInvitation?.(event.id);
                              }}
                              disabled={!isAuthenticated}
                              sx={{
                                flex: 1,
                                color: 'white',
                                borderColor: 'white',
                                '&:hover': {
                                  borderColor: 'white',
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                              }}
                            >
                              Отклонить
                            </Button>
                          </span>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip title={!isAuthenticated ? "Для записи на мероприятие необходимо авторизоваться" : ""}>
                          <span>
                            <Button
                              variant={isRegistered ? "outlined" : "contained"}
                              color={isRegistered ? "error" : "primary"}
                              onClick={handleRegistration}
                              disabled={isLoading || !isAuthenticated}
                              sx={{
                                flex: 1,
                                backgroundColor: isRegistered ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
                                color: isRegistered ? 'white' : 'primary.main',
                                borderColor: isRegistered ? 'white' : 'transparent',
                                '&:hover': {
                                  backgroundColor: isRegistered ? 'rgba(255, 255, 255, 0.1)' : 'white',
                                  borderColor: 'white'
                                }
                              }}
                            >
                              {isRegistered ? 'Отменить запись' : 'Записаться'}
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip title={!isAuthenticated ? "Для приглашения друзей необходимо авторизоваться" : ""}>
                          <span>
                            <Button
                              variant="outlined"
                              startIcon={<PersonAddIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isAuthenticated) return;
                                setIsInviteDialogOpen(true);
                              }}
                              disabled={!isAuthenticated}
                              sx={{
                                flex: 1,
                                color: 'white',
                                borderColor: 'white',
                                '&:hover': {
                                  borderColor: 'white',
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                              }}
                            >
                              Пригласить друга
                            </Button>
                          </span>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </Box>
                <IconButton
                  onClick={handleFavoriteToggle}
                  disabled={!isAuthenticated}
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

        {/* Диалог выбора друга для приглашения */}
        <Dialog 
          open={isInviteDialogOpen} 
          onClose={() => setIsInviteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          onClick={(e) => e.stopPropagation()}
        >
          <DialogTitle>Пригласить друга</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              placeholder="Поиск друзей"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <List sx={{ pt: 0 }}>
              {filteredFriends.map((friend) => (
                <ListItem
                  key={friend.id}
                  onClick={() => handleInviteFriend(friend.id)}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                >
                  <ListItemAvatar>
                    <Avatar src={friend.avatar} alt={friend.displayName} />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={friend.displayName}
                    secondary={`Общих мероприятий: ${friend.mutualEvents.length}`}
                  />
                </ListItem>
              ))}
              {filteredFriends.length === 0 && (
                <ListItem>
                  <ListItemText primary="Друзья не найдены" />
                </ListItem>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsInviteDialogOpen(false)}>Закрыть</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };