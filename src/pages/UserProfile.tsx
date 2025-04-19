import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import '../styles/cluster.css';
import { FriendsList } from '../components/FriendsList';
import { PrivacySettings } from '../components/PrivacySettings';
import { ProfileEdit } from '../components/ProfileEdit';
import { SocialUser, UpdateUser } from '../types/User';
import { Event, Status } from '../types/Event';
import EventList from '../components/EventList';
import { DefaultTag, CustomTag } from '../types/Tag';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState<SocialUser | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [friends, setFriends] = useState<SocialUser['friends']>([]);
  const [pendingRequests, setPendingRequests] = useState<SocialUser['pendingFriendRequests']>([]);
  const [eventInvitations, setEventInvitations] = useState<SocialUser['eventInvitations']>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tabErrors, setTabErrors] = useState<{ [key: number]: string | null }>({});
  const [loadedTabs, setLoadedTabs] = useState<number[]>([]);
  const [isTimeout, setIsTimeout] = useState(false);

  // Проверка авторизации при монтировании
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          navigate('/login');
          return;
        }
        const currentUser = await userService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Таймаут для загрузки данных
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsTimeout(true);
      }
    }, 10000); // 10 секунд таймаут

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Загрузка базовых данных пользователя при монтировании
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        setIsTimeout(false);
        const userData = await userService.getCurrentUser();
        setUser(userData);
        setLoadedTabs(prev => [...prev, 0]);
      } catch (err: unknown) {
        console.error('Ошибка при загрузке данных пользователя:', err);
        setTabErrors(prev => ({ ...prev, 0: 'Ошибка при загрузке данных пользователя' }));
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Загрузка данных при переключении табов
  useEffect(() => {
    const loadTabData = async () => {
      if (!user || loadedTabs.includes(activeTab)) return;

      try {
        setIsLoading(true);
        setIsTimeout(false);
        switch (activeTab) {
          case 0: // Мои мероприятия
            const userEvents = await userService.getUserEvents(user.id);
            setEvents(userEvents);
            break;
          case 1: // Друзья
            const friendsData = await userService.getFriends();
            const requestsData = await userService.getPendingFriendRequests();
            const invitationsData = await userService.getEventInvitations();
            setFriends(friendsData);
            setPendingRequests(requestsData);
            setEventInvitations(invitationsData);
            break;
          case 2: // Настройки приватности
            // Настройки приватности уже загружены с данными пользователя
            break;
          case 3: // Избранное
            const favoritesData = await userService.getFavoriteEvents();
            setFavoriteEvents(favoritesData);
            break;
        }
        setLoadedTabs(prev => [...prev, activeTab]);
        setTabErrors(prev => ({ ...prev, [activeTab]: null }));
      } catch (error) {
        console.error(`Ошибка при загрузке данных для вкладки ${activeTab}:`, error);
        setTabErrors(prev => ({ ...prev, [activeTab]: `Ошибка при загрузке данных для вкладки ${activeTab}` }));
      } finally {
        setIsLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, user, loadedTabs]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePrivacyChange = async (newSettings: SocialUser['privacySettings']) => {
    if (!user) return;
    
    try {
      const updatedUser = await userService.updatePrivacySettings(user.id, newSettings);
      setUser(updatedUser);
    } catch (err: unknown) {
      console.error('Ошибка при обновлении настроек приватности:', err);
      setTabErrors(prev => ({ ...prev, 2: 'Ошибка при обновлении настроек приватности' }));
    }
  };

  const handleProfileUpdate = async (updatedUserData: Partial<UpdateUser>) => {
    if (!user) return;
    
    try {
      const updatedUser = await userService.updateUser(updatedUserData);
      setUser(updatedUser as SocialUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      setTabErrors(prev => ({ ...prev, 0: 'Ошибка при обновлении профиля' }));
    }
  };

  const handleToggleFavorite = async (eventId: string) => {
    try {
      const updatedFavorites = await userService.toggleFavoriteEvent(eventId);
      setFavoriteEvents(updatedFavorites);
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      setTabErrors(prev => ({ ...prev, 3: 'Ошибка при обновлении избранного' }));
    }
  };

  if (isTimeout) {
    return (
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <Typography variant="h5" color="error" gutterBottom>
            Превышено время ожидания загрузки
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Пожалуйста, проверьте ваше интернет-соединение и попробуйте обновить страницу
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Обновить страницу
          </Button>
        </Box>
      </Container>
    );
  }

  if (!user && tabErrors[0]) {
    return (
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <Typography variant="h5" color="error" gutterBottom>
            Произошла ошибка
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {tabErrors[0]}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Попробовать снова
          </Button>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Загрузка данных пользователя...
          </Typography>
        </Box>
      </Container>
    );
  }

  const loadingBoxStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40vh'
  };

  const renderTabContent = (tabIndex: number, content: React.ReactNode) => {
    if (tabErrors[tabIndex]) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {tabErrors[tabIndex]}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setLoadedTabs(prev => prev.filter(tab => tab !== tabIndex));
              setTabErrors(prev => ({ ...prev, [tabIndex]: null }));
            }}
          >
            Попробовать снова
          </Button>
        </Box>
      );
    }

    if (isLoading && !loadedTabs.includes(tabIndex)) {
      return (
        <Box sx={loadingBoxStyles}>
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Загрузка...
          </Typography>
        </Box>
      );
    }

    return content;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 10, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={user.avatar}
              sx={{ width: 100, height: 100 }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4">{user.name}</Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              onClick={() => setIsEditing(true)}
            >
              Редактировать профиль
            </Button>
          </Box>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Мои мероприятия" />
            <Tab label="Друзья" />
            <Tab label="Настройки приватности" />
            <Tab label="Избранное" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {renderTabContent(0, (
            <EventList 
              events={events} 
              itemCountColumn={3} 
              favoriteEvents={favoriteEvents.map(e => e.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {renderTabContent(1, (
            <FriendsList 
              friends={friends}
              pendingRequests={pendingRequests}
              eventInvitations={eventInvitations}
              onAddFriend={() => {}}
              onAcceptRequest={() => {}}
              onRejectRequest={() => {}}
              onRemoveFriend={() => {}}
              onAcceptInvitation={() => {}}
              onDeclineInvitation={() => {}}
              favoriteEvents={favoriteEvents.map(e => e.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {renderTabContent(2, (
            <PrivacySettings
              settings={user?.privacySettings || { eventsVisibility: 'PUBLIC', friendsListVisibility: 'PUBLIC' }}
              onSettingsChange={handlePrivacyChange}
            />
          ))}
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {renderTabContent(3, (
            <EventList 
              events={favoriteEvents} 
              itemCountColumn={3}
              favoriteEvents={favoriteEvents.map(e => e.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </TabPanel>

        {isEditing && (
          <ProfileEdit 
            user={user} 
            onSave={handleProfileUpdate}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </Box>
    </Container>
  );
};

export default UserProfile; 