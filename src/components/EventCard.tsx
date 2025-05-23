import React, { useState, useEffect, memo } from 'react';
import { Event, ModerationStatus, NotableParticipant } from '../types/Event';
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
  Tooltip,
  Divider,
  Rating,
  Stack,
  CircularProgress,
  Paper
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import CommentIcon from '@mui/icons-material/Comment';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { DefaultTag, defaultTagColors, CustomTag, DEFAULT_CUSTOM_TAG_COLOR, Tag } from '../types/Tag';
import { Friend, SocialUser } from '../types/User';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { Verified, Person, Group, EmojiEvents as NotableIcon } from '@mui/icons-material';


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

// Обновляем интерфейс комментария
interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  date: string;
  rating: number;
}

interface EventStats {
  views: number;
  participants: number;
  comments: number;
  averageRating: number;
}

// Добавляем моковые данные для известных участников
const mockNotableParticipants: NotableParticipant[] = [
  {
    id: "1",
    name: "Илон Маск",
    role: "SPEAKER",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg",
    description: "CEO Tesla и SpaceX",
    isVerified: true
  },
  {
    id: "2",
    name: "Марк Цукерберг",
    role: "GUEST",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg",
    description: "CEO Meta",
    isVerified: true
  },
  {
    id: "3",
    name: "Анна Семенович",
    role: "ORGANIZER",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Anna_Semenovich_2016.jpg/800px-Anna_Semenovich_2016.jpg",
    description: "Певица и организатор мероприятий",
    isVerified: true
  },
  {
    id: "4",
    name: "Дмитрий Нагиев",
    role: "SPEAKER",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dmitriy_Nagiev_2019.jpg/800px-Dmitriy_Nagiev_2019.jpg",
    description: "Актер и телеведущий",
    isVerified: true
  }
];

// Обновляем компонент для отображения известных участников
const NotableParticipantsList: React.FC<{ participants: NotableParticipant[] }> = ({ participants }) => {
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {participants.map((participant) => (
          <Chip
            key={participant.id}
            avatar={
              <Avatar 
                src={participant.avatar}
                sx={{ 
                  width: 24, 
                  height: 24,
                  bgcolor: 'primary.main',
                  '& .MuiSvgIcon-root': {
                    fontSize: '1rem'
                  }
                }}
              >
                <Person />
              </Avatar>
            }
            label={
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                fontSize: '0.875rem'
              }}>
                {participant.name}
                {participant.isVerified && (
                  <Verified 
                    fontSize="small" 
                    color="primary"
                    sx={{ 
                      fontSize: '1rem',
                      ml: 0.5
                    }} 
                  />
                )}
              </Box>
            }
            size="small"
            variant="outlined"
            sx={{
              height: 28,
              '& .MuiChip-label': {
                px: 1,
                fontSize: '0.875rem'
              },
              '& .MuiChip-avatar': {
                width: 24,
                height: 24,
                marginLeft: 0.5,
                marginRight: -4
              },
              borderColor: 'primary.light',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              }
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

// Создаем мемоизированную версию EventCard
const EventCardComponent: React.FC<{ 
  event: Event;
  isInvitation?: boolean;
  onAcceptInvitation?: (eventId: string) => void;
  onDeclineInvitation?: (eventId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
  friends?: Friend[];
  onInviteFriend?: (eventId: string, friendId: string) => void;
  showModerationStatus?: boolean;
  onModerateEvent?: (eventId: string, status: ModerationStatus) => void;
  isModeratorPage?: boolean;
}> = ({ 
  event,
  isInvitation,
  onAcceptInvitation,
  onDeclineInvitation,
  isFavorite = false,
  onToggleFavorite,
  friends = [],
  onInviteFriend,
  showModerationStatus = false,
  onModerateEvent,
  isModeratorPage = false
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showRipple, setShowRipple] = useState(false);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const isAuthenticated = authService.isAuthenticated();
    const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([
      {
        id: '1',
        userId: 'user1',
        userName: 'Иван Иванов',
        text: 'Отличное мероприятие! Обязательно пойду.',
        date: '2024-03-15T14:30',
        rating: 5
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Мария Петрова',
        text: 'Интересная тема, надеюсь будет полезно.',
        date: '2024-03-15T15:45',
        rating: 4
      }
    ]);
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState<number | null>(null);
    const [averageRating, setAverageRating] = useState(0);
    const [currentUser, setCurrentUser] = useState<SocialUser | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const [stats, setStats] = useState<EventStats>({
      views: Math.floor(Math.random() * 1000) + 100, // Тестовые данные
      participants: Math.floor(Math.random() * 100) + 10,
      comments: comments.length,
      averageRating: averageRating
    });

    // Мемоизируем URL изображений
    const frontImageUrl = React.useMemo(() => event.image || 'https://via.placeholder.com/300x200', [event.image]);
    const backImageUrl = React.useMemo(() => event.location.image || 'https://via.placeholder.com/300x400', [event.location.image]);

    // Мемоизируем отфильтрованных друзей
    const filteredFriends = React.useMemo(() => 
      friends.filter(friend =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      [searchTerm, friends]
    );

    // Добавляем моковые данные к событию, если их нет
    const eventWithNotableParticipants = React.useMemo(() => {
      if (!event.notableParticipants) {
        // Выбираем случайное количество участников (1-3) из моковых данных
        const randomCount = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...mockNotableParticipants].sort(() => 0.5 - Math.random());
        return {
          ...event,
          notableParticipants: shuffled.slice(0, randomCount),
          isNotableEvent: true
        };
      }
      return event;
    }, [event]);

    // Проверяем статус регистрации при монтировании и при изменении event.id
    useEffect(() => {
      const checkRegistrationStatus = async () => {
        if (!isAuthenticated) {
          setIsRegistered(false);
          return;
        }
        try {
          const status = await userService.checkEventRegistration(event.id);
          setIsRegistered(status);
        } catch (error) {
          console.error('Ошибка при проверке статуса регистрации:', error);
          setIsRegistered(false);
        }
      };
      checkRegistrationStatus();
    }, [event.id, isAuthenticated]);

    // Загружаем изображения при монтировании
    React.useEffect(() => {
      const loadImages = async () => {
        setImagesLoaded(false);
        try {
          const frontImg = new Image();
          const backImg = new Image();
          
          const frontLoadPromise = new Promise((resolve) => {
            frontImg.onload = resolve;
            frontImg.src = frontImageUrl;
          });
          
          const backLoadPromise = new Promise((resolve) => {
            backImg.onload = resolve;
            backImg.src = backImageUrl;
          });
          
          await Promise.all([frontLoadPromise, backLoadPromise]);
          setImagesLoaded(true);
        } catch (error) {
          console.error('Error loading images:', error);
          setImagesLoaded(true);
        }
      };
      
      loadImages();
    }, [frontImageUrl, backImageUrl]);

    // Вычисляем среднюю оценку при изменении комментариев
    useEffect(() => {
      if (comments.length > 0) {
        const sum = comments.reduce((acc, comment) => acc + comment.rating, 0);
        setAverageRating(sum / comments.length);
      } else {
        setAverageRating(0);
      }
    }, [comments]);

    // Обновляем статистику при изменении комментариев
    useEffect(() => {
      setStats(prev => ({
        ...prev,
        comments: comments.length,
        averageRating: averageRating
      }));
    }, [comments, averageRating]);

    // Загружаем данные текущего пользователя при монтировании
    useEffect(() => {
      const loadCurrentUser = async () => {
        if (!isAuthenticated) return;
        
        try {
          setIsLoadingUser(true);
          const userData = await userService.getCurrentUser();
          setCurrentUser(userData);
        } catch (error) {
          console.error('Ошибка при загрузке данных пользователя:', error);
        } finally {
          setIsLoadingUser(false);
        }
      };

      loadCurrentUser();
    }, [isAuthenticated]);

    const getTagColor = (tag: Tag): string => {
      if (typeof tag === 'string') {
        return defaultTagColors[tag as DefaultTag];
      }
      return tag.color || DEFAULT_CUSTOM_TAG_COLOR;
    };
  
    const getTagLabel = (tag: Tag): string => {
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
      } else {
        setIsCommentsDialogOpen(true);
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
  
    // Добавляем обработчики для модерации
    const handleModerate = (e: React.MouseEvent, status: ModerationStatus) => {
      e.stopPropagation();
      onModerateEvent?.(event.id, status);
    };

    const handleAddComment = () => {
      if ((!newComment.trim() && !newRating) || !isAuthenticated || !currentUser) return;

      const comment: Comment = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        text: newComment.trim(),
        date: new Date().toISOString(),
        rating: newRating || 0
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setNewRating(null);
    };

    // Добавляем стили для карточки с известными участниками
    const cardStyles = React.useMemo(() => ({
      position: 'relative' as const,
      transition: 'transform 0.6s',
      transformStyle: 'preserve-3d' as const,
      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      cursor: 'pointer',
      ...(event.isNotableEvent && {
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ffd700, #ffa500)',
          zIndex: 1,
        },
      }),
    }), [isFlipped, event.isNotableEvent]);

    return (
      <>
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
                    image={frontImageUrl}
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
                  {showModerationStatus && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        display: 'flex',
                        fontSize: 16,
                        color: event.moderationStatus === ModerationStatus.APPROVED ? 'green' : 
                               event.moderationStatus === ModerationStatus.REJECTED ? 'red' : 'orange',
                        fontWeight: 'bold',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '10px',
                        padding: '5px 10px',
                      }}>
                      {event.moderationStatus}
                    </Box>
                  )}
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
                  <CardMedia
                    component="img"
                    height="100%"
                    width="100%"
                    image={backImageUrl}
                    sx={{ 
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
                      background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0) 100%)',
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

                    {/* Добавляем секцию с известными участниками */}
                    {eventWithNotableParticipants.notableParticipants && 
                     eventWithNotableParticipants.notableParticipants.length > 0 && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
                          Участники мероприятия:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                          {eventWithNotableParticipants.notableParticipants.map((participant) => (
                            <Chip
                              key={participant.id}
                              avatar={
                                <Avatar 
                                  src={participant.avatar}
                                  sx={{ 
                                    width: 24, 
                                    height: 24,
                                    bgcolor: 'primary.main',
                                    '& .MuiSvgIcon-root': {
                                      fontSize: '1rem'
                                    }
                                  }}
                                >
                                  <Person />
                                </Avatar>
                              }
                              label={
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 0.5,
                                  fontSize: '0.875rem',
                                  color: 'white'
                                }}>
                                  {participant.name}
                                  {participant.isVerified && (
                                    <Verified 
                                      fontSize="small" 
                                      sx={{ 
                                        fontSize: '1rem',
                                        color: '#ffd700'
                                      }} 
                                    />
                                  )}
                                </Box>
                              }
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 28,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                '& .MuiChip-label': {
                                  px: 1,
                                  pl: 2.5,
                                  fontSize: '0.875rem',
                                  color: 'white'
                                },
                                '& .MuiChip-avatar': {
                                  width: 24,
                                  height: 24,
                                  marginLeft: 0.5,
                                  marginRight: 0
                                },
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  borderColor: 'rgba(255, 255, 255, 0.5)'
                                }
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

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
                      {isModeratorPage && event.moderationStatus === ModerationStatus.PENDING && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={(e) => handleModerate(e, ModerationStatus.APPROVED)}
                            size="small"
                          >
                            Принять
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<CloseIcon />}
                            onClick={(e) => handleModerate(e, ModerationStatus.REJECTED)}
                            size="small"
                          >
                            Отклонить
                          </Button>
                        </Box>
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
                    <Avatar src={friend.avatar} alt={friend.name} />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={friend.name}
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

        {/* Диалог комментариев */}
        <Dialog 
          open={isCommentsDialogOpen} 
          onClose={() => setIsCommentsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          onClick={(e) => e.stopPropagation()}
        >
          <DialogTitle>
            Комментарии к мероприятию
            <IconButton
              aria-label="close"
              onClick={() => setIsCommentsDialogOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.description}
              </Typography>

              {/* Статистика мероприятия */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mt: 2, 
                  mb: 2,
                  backgroundColor: 'background.default',
                  borderRadius: 2
                }}
              >
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(4, 1fr)'
                  },
                  gap: 2,
                  '& > *': {
                    textAlign: 'center'
                  }
                }}>
                  <Box>
                    <TrendingUpIcon color="primary" sx={{ fontSize: 28 }} />
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {stats.views}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Просмотров
                    </Typography>
                  </Box>
                  <Box>
                    <PeopleIcon color="primary" sx={{ fontSize: 28 }} />
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {stats.participants}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Участников
                    </Typography>
                  </Box>
                  <Box>
                    <CommentIcon color="primary" sx={{ fontSize: 28 }} />
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {stats.comments}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Комментариев
                    </Typography>
                  </Box>
                  <Box>
                    <StarIcon color="primary" sx={{ fontSize: 28 }} />
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {stats.averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Средняя оценка
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              {/* Средняя оценка */}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                <Rating
                  value={averageRating}
                  precision={0.5}
                  readOnly
                  size="large"
                  icon={<StarIcon fontSize="inherit" />}
                  emptyIcon={<StarBorderIcon fontSize="inherit" />}
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {averageRating.toFixed(1)} ({comments.length} {comments.length === 1 ? 'оценка' : 
                    comments.length < 5 ? 'оценки' : 'оценок'})
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            
            {/* Форма добавления комментария */}
            {isAuthenticated && (
              <Box sx={{ mb: 3 }}>
                <Stack spacing={2}>
                  {isLoadingUser ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Ваша оценка:
                        </Typography>
                        <Rating
                          value={newRating}
                          onChange={(_, value) => setNewRating(value)}
                          size="large"
                          icon={<StarIcon fontSize="inherit" />}
                          emptyIcon={<StarBorderIcon fontSize="inherit" />}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Написать комментарий..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddComment}
                        disabled={!newRating && !newComment.trim()}
                        sx={{ alignSelf: 'flex-end' }}
                      >
                        Отправить
                      </Button>
                    </>
                  )}
                </Stack>
              </Box>
            )}

            {/* Список комментариев */}
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start" sx={{ flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar src={comment.userAvatar} alt={comment.userName}>
                        {comment.userName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {comment.userName}
                          <Rating
                            value={comment.rating}
                            readOnly
                            size="small"
                            icon={<StarIcon fontSize="inherit" />}
                            emptyIcon={<StarBorderIcon fontSize="inherit" />}
                          />
                        </Box>
                      }
                      secondary={new Date(comment.date).toLocaleString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    />
                  </Box>
                  {comment.text && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ pl: 9 }}
                    >
                      {comment.text}
                    </Typography>
                  )}
                  <Divider variant="inset" component="li" sx={{ mt: 2 }} />
                </ListItem>
              ))}
              {comments.length === 0 && (
                <ListItem>
                  <ListItemText primary="Пока нет комментариев и оценок" />
                </ListItem>
              )}
            </List>
          </DialogContent>
        </Dialog>
      </>
    );
  };

// Создаем мемоизированную версию компонента
export const EventCard = memo(EventCardComponent, (prevProps: {
  event: Event;
  isInvitation?: boolean;
  onAcceptInvitation?: (eventId: string) => void;
  onDeclineInvitation?: (eventId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
  friends?: Friend[];
  onInviteFriend?: (eventId: string, friendId: string) => void;
  showModerationStatus?: boolean;
  onModerateEvent?: (eventId: string, status: ModerationStatus) => void;
  isModeratorPage?: boolean;
}, nextProps: {
  event: Event;
  isInvitation?: boolean;
  onAcceptInvitation?: (eventId: string) => void;
  onDeclineInvitation?: (eventId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
  friends?: Friend[];
  onInviteFriend?: (eventId: string, friendId: string) => void;
  showModerationStatus?: boolean;
  onModerateEvent?: (eventId: string, status: ModerationStatus) => void;
  isModeratorPage?: boolean;
}) => {
  // Сравниваем все важные пропсы
  const prevFriends = prevProps.friends || [];
  const nextFriends = nextProps.friends || [];
  
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.moderationStatus === nextProps.event.moderationStatus &&
    prevProps.event.status === nextProps.event.status &&
    prevProps.isInvitation === nextProps.isInvitation &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.showModerationStatus === nextProps.showModerationStatus &&
    prevProps.isModeratorPage === nextProps.isModeratorPage &&
    prevFriends.length === nextFriends.length &&
    JSON.stringify(prevFriends) === JSON.stringify(nextFriends)
  );
});