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
import { AddFriendDialog } from '../components/AddFriendDialog';
import { PrivacySetting, SocialUser, UpdateUser, UserRole } from '../types/User';
import { Event } from '../types/Event';
import EventList from '../components/EventList';
import { userService } from '../services/userService';

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
  // помогите 😭
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState<SocialUser | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [friends, setFriends] = useState<SocialUser['friends']>([]);
  const [eventInvitations, setEventInvitations] = useState<SocialUser['eventInvitations']>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tabErrors, setTabErrors] = useState<{ [key: number]: string | null }>({});
  const [loadedTabs, setLoadedTabs] = useState<number[]>([]);
  const [isTimeout, setIsTimeout] = useState(false);
  const [isAddFriendDialogOpen, setIsAddFriendDialogOpen] = useState(false);
  const [friendsUpdateTrigger, setFriendsUpdateTrigger] = useState(0);

  // // Проверка авторизации при монтировании
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const token = authService.getToken();
  //       if (!token) {
  //         navigate('/login');
  //         return;
  //       }
  //       const currentUser = await userService.getCurrentUser();
  //       setUser(currentUser);
  //     } catch (error) {
  //       console.error('Ошибка при проверке авторизации:', error);
  //       navigate('/login');
  //     }
  //   };

  //   checkAuth();
  // }, [navigate]);

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

        // const userData = await userService.getCurrentUser();
        const userData = {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          avatar: 'https://via.placeholder.com/150',
          friends: [],
          eventInvitations: [],
          privacySettings: {
            eventsVisibility: PrivacySetting.PUBLIC,
            friendsListVisibility: PrivacySetting.PUBLIC
          },
          pendingFriendRequests: [],
          events: [],
          role: UserRole.PARTICIPANT,
          description: 'Описание пользователя',
          activity_area: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setUser(userData);

        // Загружаем данные друзей сразу при монтировании
        const [friendsData, requestsData, invitationsData] = await Promise.all([
          userService.getFriends(),
          userService.getPendingFriendRequests(),
          userService.getEventInvitations()
        ]);
        console.log('Initial friends data:', friendsData);
        setFriends(friendsData);
        setEventInvitations(invitationsData);
      } catch (err: unknown) {
        console.error('Ошибка при загрузке данных пользователя:', err);
        setTabErrors(prev => ({ ...prev, 0: 'Ошибка при загрузке данных пользователя' }));
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Обновляем данные при изменении триггера
  useEffect(() => {
    const updateFriendsData = async () => {
      if (!user) return;

      try {
        console.log('Updating friends data due to trigger change');
        const [friendsData, requestsData, invitationsData] = await Promise.all([
          userService.getFriends(),
          userService.getPendingFriendRequests(),
          userService.getEventInvitations()
        ]);
        console.log('Updated friends data:', friendsData);
        setFriends(friendsData);
        setEventInvitations(invitationsData);
      } catch (error) {
        console.error('Ошибка при обновлении данных друзей:', error);
        setTabErrors(prev => ({ ...prev, 1: 'Ошибка при обновлении данных друзей' }));
      }
    };

    updateFriendsData();
  }, [friendsUpdateTrigger, user]);

  // Загрузка данных при переключении табов или обновлении друзей
  useEffect(() => {
    const loadTabData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setIsTimeout(false);
        switch (activeTab) {
          case 0: // Мои мероприятия
            if (!loadedTabs.includes(activeTab)) {
              const userEvents = await userService.getUserEvents();
              setEvents(userEvents);
            }
            break;
          case 1: // Друзья
            // Убедимся, что таб считается "загруженным", чтобы не показывать спиннер
            if (!loadedTabs.includes(activeTab)) {
              setLoadedTabs(prev => [...prev, activeTab]);
            }
            setTabErrors(prev => ({ ...prev, [activeTab]: null })); // Сбросим ошибку, если она была
            break;
          case 2:
            break;
          case 3: // Избранное
            if (!loadedTabs.includes(activeTab)) {
              const favoritesData = await userService.getFavoriteEvents();
              setFavoriteEvents(favoritesData);
            }
            break;
        }
        setTabErrors(prev => ({ ...prev, [activeTab]: null }));
      } catch (error) {
        console.error(`Ошибка при загрузке данных для вкладки ${activeTab}:`, error);
        setTabErrors(prev => ({ ...prev, [activeTab]: error instanceof Error ? error.message : `Ошибка при загрузке данных для вкладки ${error}` }));
      } finally {
        setIsLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, user, loadedTabs]);


  const loadFriends = async () => {
    try {
      const friendsData = await userService.getFriends();
      console.log('Loaded friends:', friendsData);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
      setTabErrors(prev => ({ ...prev, 1: 'Ошибка при загрузке списка друзей' }));
    }
  };

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

  // Принятие заявки
  const handleAcceptRequest = async (userId: string) => {
    try {
      await userService.acceptFriendRequest(userId, true);
      // Обновляем списки через триггер
      setFriendsUpdateTrigger(prev => prev + 1);
      // Очищаем ошибку для вкладки заявок
      setTabErrors(prev => ({ ...prev, 1: null }));
    } catch (error) {
      console.error('Ошибка при принятии заявки:', error);
      setTabErrors(prev => ({ ...prev, 1: 'Ошибка при принятии заявки' }));
    }
  };

  // Отклонение заявки
  const handleRejectRequest = async (userId: string) => {
    try {
      await userService.acceptFriendRequest(userId, false);
      // Обновляем списки через триггер
      setFriendsUpdateTrigger(prev => prev + 1);
      // Очищаем ошибку для вкладки заявок
      setTabErrors(prev => ({ ...prev, 1: null }));
    } catch (error) {
      console.error('Ошибка при отклонении заявки:', error);
      setTabErrors(prev => ({ ...prev, 1: 'Ошибка при отклонении заявки' }));
    }
  };

  // Обновляем функцию добавления друга
  const handleAddFriend = async (friendId: string) => {
    try {
      console.log('Adding friend with ID:', friendId);
      await userService.addFriend(friendId);
      // Обновляем списки через триггер
      setFriendsUpdateTrigger(prev => prev + 1);
      // Очищаем ошибку для вкладки друзей
      setTabErrors(prev => ({ ...prev, 1: null }));
      // Принудительно обновляем данные друзей
      const updatedFriends = await userService.getFriends();
      console.log('Updated friends after adding:', updatedFriends);
      setFriends(updatedFriends);
    } catch (error) {
      console.error('Ошибка при добавлении друга:', error);
      setTabErrors(prev => ({ ...prev, 1: 'Ошибка при добавлении друга' }));
    }
  };

  // Удаление друга
  const handleRemoveFriend = async (friendId: string) => {
    try {
      await userService.removeFriend(friendId);
      // Обновляем списки через триггер
      setFriendsUpdateTrigger(prev => prev + 1);
      // Очищаем ошибку для вкладки друзей
      setTabErrors(prev => ({ ...prev, 1: null }));
    } catch (error) {
      console.error('Ошибка при удалении друга:', error);
      setTabErrors(prev => ({ ...prev, 1: 'Ошибка при удалении друга' }));
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
    if (tabIndex === 1) { // Вкладка "Друзья"
      return content; // Не показываем общие ошибки для вкладки друзей
    }

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Друзья</Typography>
            <Button
              variant="contained"
              onClick={() => setIsAddFriendDialogOpen(true)}
            >
              Добавить друга
            </Button>
          </Box>
          {renderTabContent(1, (
            <FriendsList
              eventInvitations={eventInvitations}
              onAddFriend={handleAddFriend}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onRemoveFriend={handleRemoveFriend}
              onAcceptInvitation={() => { }}
              onDeclineInvitation={() => { }}
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

      <AddFriendDialog
        open={isAddFriendDialogOpen}
        onClose={() => setIsAddFriendDialogOpen(false)}
        onAddFriend={handleAddFriend}
      />
    </Container>
  );
};

export default UserProfile; 