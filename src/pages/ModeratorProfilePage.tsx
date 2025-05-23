import React, { useState, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { UserRole, User, ModeratorUser, OrganizerUser, ParticipantUser, isParticipant } from '../types/User';
import { Event, Status, ModerationStatus } from '../types/Event';
import OrganizationRequestSearchAndFilter from '../components/OrganizationRequestSearchAndFilter';
import UserSearchAndFilter from '../components/UserSearchAndFilter';
import SearchAndFilter from '../components/SearchAndFilter';
import EventList from '../components/EventList';
import EventEditDialog from '../components/EventEditDialog';
import UserCard from '../components/UserCard';
import { EventCard } from '../components/EventCard';
import { CustomTag, DefaultTag } from '../types/Tag';


export interface OrganizationRequest extends OrganizerUser {
  isApproved: boolean;
}

const ModeratorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [moderationFilter, setModerationFilter] = useState<ModerationStatus>(ModerationStatus.PENDING);
  const [isCreateAdminDialogOpen, setIsCreateAdminDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<OrganizationRequest | null>(null);
  const [adminData, setAdminData] = useState<Pick<ModeratorUser, 'email' | 'name'> & { password: string }>({
    email: '',
    password: '',
    name: '',
  });
  const [organizationRequests, setOrganizationRequests] = useState<OrganizationRequest[]>([
    {
      id: '1',
      email: 'org1@example.com',
      name: 'Организация 1',
      role: UserRole.ORGANIZER,
      description: 'Описание организации 1',
      events: [],
      isApproved: false,
      avatar: '',
      activity_area: 'Сфера деятельности 1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      email: 'org2@example.com',
      name: 'Организация 2',
      role: UserRole.ORGANIZER,
      description: 'Описание организации 2',
      events: [],
      isApproved: false,
      avatar: '',
      activity_area: 'Сфера деятельности 2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
  ]);

  const [filteredRequests, setFilteredRequests] = useState<OrganizationRequest[]>(organizationRequests);

  const handleFilterChange = (filtered: OrganizationRequest[]) => {
    setFilteredRequests(filtered);
  };

  const handleResetSelection = () => {
    setSelectedRequest(null);
    setFilteredRequests(organizationRequests);
  };

  // Моковые данные для демонстрации
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'user1@example.com',
      name: 'Участник 1',
      role: UserRole.PARTICIPANT,
      interests: ['Конференции', 'Воркшопы'],
      avatar: '',
      description: '',
      activity_area: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as ParticipantUser,
    {
      id: '2',
      email: 'org1@example.com',
      name: 'Организатор 1',
      role: UserRole.ORGANIZER,
      description: 'Описание организации 1',
      events: [],
      avatar: '',
      activity_area: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as OrganizerUser,
  ]);

  const img1 = `${process.env.PUBLIC_URL}test.jpg`;
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Тестовое событие',
      description: 'Описание тестового события',
      date: '2024-03-20T10:00',
      duration: '2 часа',
      organizer: 'Тестовый организатор',
      status: Status.COMINGUP,
      moderationStatus: ModerationStatus.PENDING,
      location: {
        lat: 55.7558,
        lng: 37.6173,
        address: 'Москва, Красная площадь',
        image:  `${process.env.PUBLIC_URL}test3.jpg`
      },
      tags: [DefaultTag.CONFERENCE],
      image:  `${process.env.PUBLIC_URL}test3.jpg`
    },
    {
      id: '2',
      title: 'Второе тестовое событие',
      description: 'Описание второго тестового события',
      date: '2024-03-25T15:00',
      duration: '3 часа',
      organizer: 'Другой организатор',
      status: Status.COMINGUP,
      moderationStatus: ModerationStatus.PENDING,
      location: {
        lat: 55.751244,
        lng: 37.618423,
        address: 'Москва, Тверская улица',
        image: `${process.env.PUBLIC_URL}test3.jpg`
      },
      tags: [DefaultTag.WORKSHOP],
      image: `${process.env.PUBLIC_URL}test3.jpg`
    }
  ]);

  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  const handleUserFilterChange = (filtered: User[]) => {
    setFilteredUsers(filtered);
  };

  const handleUserResetSelection = () => {
    setSelectedUser(null);
    setFilteredUsers(users);
  };

  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  // Мемоизируем функцию фильтрации
  const filterEvents = useCallback((eventsToFilter: Event[]) => {
    return eventsToFilter.filter(event => event.moderationStatus === moderationFilter);
  }, [moderationFilter]);

  // Обновляем отфильтрованные события только при изменении фильтра или списка событий
  React.useEffect(() => {
    const filtered = events.filter(event => event.moderationStatus === moderationFilter);
    setFilteredEvents(filtered);
  }, [moderationFilter, events]);

  // Мемоизируем обработчики событий
  const handleModerateEvent = (eventId: string, status: ModerationStatus) => {
    // Обновляем список всех событий
    setEvents(prevEvents => {
      const updatedEvents = prevEvents.map(event =>
        event.id === eventId
          ? { ...event, moderationStatus: status }
          : event
      );
      return updatedEvents;
    });
  };

  const handleSaveEvent = useCallback((updatedEvent: Event) => {
    const eventWithModeration: Event = {
      ...updatedEvent,
      moderationStatus: updatedEvent.moderationStatus || ModerationStatus.PENDING
    };
    setEvents(prevEvents => 
      prevEvents.map(event =>
        event.id === eventWithModeration.id ? eventWithModeration : event
      )
    );
    setIsEditEventDialogOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleCreateEvent = useCallback((newEvent: Event) => {
    const eventWithModeration: Event = {
      ...newEvent,
      moderationStatus: ModerationStatus.PENDING
    };
    setEvents(prevEvents => [...prevEvents, eventWithModeration]);
    setIsCreateEventDialogOpen(false);
  }, []);

  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsEditEventDialogOpen(true);
  }, []);

  // Мемоизируем обработчик изменения фильтра модерации
  const handleModerationFilterChange = useCallback((newFilter: ModerationStatus) => {
    setModerationFilter(newFilter);
  }, []);

  const handleCreateAdmin = () => {
    // Здесь будет логика создания администратора
    setIsCreateAdminDialogOpen(false);
    setAdminData({ email: '', password: '', name: '' });
  };

  const handleApproveOrganization = (id: string) => {
    // Находим заявку, которую нужно одобрить
    const requestToApprove = organizationRequests.find(org => org.id === id);
    if (!requestToApprove) return;

    // Создаем нового организатора на основе заявки
    const newOrganizer: OrganizerUser = {
      id: requestToApprove.id,
      email: requestToApprove.email,
      name: requestToApprove.name,
      role: UserRole.ORGANIZER,
      description: requestToApprove.description,
      events: [],
      avatar: '',
      activity_area: requestToApprove.activity_area,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Обновляем состояние
    setOrganizationRequests(prev => prev.filter(org => org.id !== id));
    setFilteredRequests(prev => prev.filter(org => org.id !== id));
    setUsers(prev => [...prev, newOrganizer]);
    setFilteredUsers(prev => [...prev, newOrganizer]);
  };

  const handleRejectOrganization = (id: string) => {
    setOrganizationRequests(prev =>
      prev.filter(org => org.id !== id)
    );
    setFilteredRequests(prev =>
      prev.filter(org => org.id !== id)
    );
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditEventDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;

    // Обновляем пользователя в списке
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      )
    );
    setFilteredUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      )
    );

    // Закрываем диалог и сбрасываем выбранного пользователя
    setIsEditUserDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setFilteredEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setIsEditEventDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    // Удаляем пользователя из списков
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete));
    setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete));
    
    // Если удаляемый пользователь был выбран, сбрасываем выбор
    if (selectedUser?.id === userToDelete) {
      setSelectedUser(null);
    }

    // Закрываем диалог и сбрасываем ID пользователя
    setIsDeleteUserDialogOpen(false);
    setUserToDelete(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
    const file = event.target.files?.[0];
    if (file && selectedEvent) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedEvent(prev => prev ? { 
          ...prev, 
          ...(isFront ? { image: reader.result as string } : {
            location: {
              ...prev.location,
              image: reader.result as string
            }
          })
        } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = (isFront: boolean) => {
    if (selectedEvent) {
      setSelectedEvent(prev => prev ? { 
        ...prev, 
        ...(isFront ? { image: undefined } : {
          location: {
            ...prev.location,
            image: undefined
          }
        })
      } : null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Панель модератора
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="События" />
          <Tab label="Пользователи" />
          <Tab label="Заявки на организатора" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="subtitle1">Фильтр по статусу:</Typography>
            <Button
              variant={moderationFilter === ModerationStatus.PENDING ? 'contained' : 'outlined'}
              onClick={() => setModerationFilter(ModerationStatus.PENDING)}
            >
              На модерацию
            </Button>
            <Button
              variant={moderationFilter === ModerationStatus.APPROVED ? 'contained' : 'outlined'}
              onClick={() => setModerationFilter(ModerationStatus.APPROVED)}
            >
              Принятые
            </Button>
            <Button
              variant={moderationFilter === ModerationStatus.REJECTED ? 'contained' : 'outlined'}
              onClick={() => setModerationFilter(ModerationStatus.REJECTED)}
            >
              Отклоненные
            </Button>
          </Box>

          {/* <SearchAndFilter
            events={filteredEvents}
            onFilterChange={setFilteredEvents}
            selectedEvent={selectedEvent}
            onResetSelection={() => setSelectedEvent(null)}
            isModerator={true}
          /> */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {filteredEvents.map((event) => (
              <Box key={event.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' }, mb: 2 }}>
                <Box 
                  onClick={() => handleEventClick(event)} 
                  sx={{ cursor: 'pointer' }}
                >
                  {event && <EventCard
                    key={event.id}
                    event={event}
                    onToggleFavorite={() => {}}
                    showModerationStatus={true}
                    onAcceptInvitation={() => handleModerateEvent(event.id, ModerationStatus.APPROVED)}
                    onDeclineInvitation={() => handleModerateEvent(event.id, ModerationStatus.REJECTED)}
                    isInvitation={true}
                  />}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        <>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Пользователи
          </Typography>
          <Box sx={{ mb: 3 }}>
            <UserSearchAndFilter 
              users={users}
              onFilterChange={handleUserFilterChange}
              selectedUser={selectedUser}
              onResetSelection={handleUserResetSelection}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {filteredUsers.map((user) => (
              <Box key={user.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.33% - 24px)' } }}>
                <UserCard
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={() => handleDeleteUser(user.id)}
                />
              </Box>
            ))}
          </Box>
        </>
      )}

      {activeTab === 2 && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <Button
              variant={moderationFilter === ModerationStatus.PENDING ? "contained" : "outlined"}
              onClick={() => setModerationFilter(ModerationStatus.PENDING)}
            >
              На модерации
            </Button>
            <Button
              variant={moderationFilter === ModerationStatus.APPROVED ? "contained" : "outlined"}
              onClick={() => setModerationFilter(ModerationStatus.APPROVED)}
            >
              Одобренные
            </Button>
            <Button
              variant={moderationFilter === ModerationStatus.REJECTED ? "contained" : "outlined"}
              onClick={() => setModerationFilter(ModerationStatus.REJECTED)}
            >
              Отклоненные
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showModerationStatus={true}
                isModeratorPage={true}
                onModerateEvent={handleModerateEvent}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Диалог создания администратора */}
      <Dialog 
        open={isCreateAdminDialogOpen} 
        onClose={() => setIsCreateAdminDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Создание администратора
          <IconButton
            aria-label="close"
            onClick={() => setIsCreateAdminDialogOpen(false)}
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
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              value={adminData.email}
              onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={adminData.password}
              onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Имя"
              value={adminData.name}
              onChange={(e) => setAdminData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateAdminDialogOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateAdmin}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования пользователя */}
      <Dialog 
        open={isEditUserDialogOpen} 
        onClose={() => setIsEditUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Редактирование пользователя
          <IconButton
            aria-label="close"
            onClick={() => setIsEditUserDialogOpen(false)}
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
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              value={selectedUser?.email || ''}
              onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Имя"
              value={selectedUser?.name || ''}
              onChange={(e) => setSelectedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Роль</InputLabel>
              <Select
                value={selectedUser?.role || ''}
                label="Роль"
                onChange={(e) => {
                  const newRole = e.target.value as UserRole;
                  if (selectedUser) {
                    let updatedUser: ModeratorUser | OrganizerUser | ParticipantUser;
                    switch (newRole) {
                      case UserRole.PARTICIPANT:
                        updatedUser = {
                          ...selectedUser,
                          role: UserRole.PARTICIPANT,
                        } as ParticipantUser;
                        break;
                      case UserRole.ORGANIZER:
                        updatedUser = {
                          ...selectedUser,
                          role: UserRole.ORGANIZER,
                          name: '',
                          description: '',
                          activity_area: '',
                          events: []
                        } as OrganizerUser;
                        break;
                      case UserRole.MODERATOR:
                        updatedUser = {
                          ...selectedUser,
                          role: UserRole.MODERATOR
                        } as ModeratorUser;
                        break;
                      default:
                        updatedUser = selectedUser as ModeratorUser | OrganizerUser | ParticipantUser;
                    }
                    setSelectedUser(updatedUser);
                  }
                }}
              >
                <MenuItem value={UserRole.PARTICIPANT}>Участник</MenuItem>
                <MenuItem value={UserRole.ORGANIZER}>Организатор</MenuItem>
                <MenuItem value={UserRole.MODERATOR}>Администратор</MenuItem>
              </Select>
            </FormControl>
            {selectedUser?.role === UserRole.ORGANIZER && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Описание"
                  value={(selectedUser as OrganizerUser).description || ''}
                  onChange={(e) => setSelectedUser(prev => prev ? { 
                    ...prev, 
                    description: e.target.value 
                  } as OrganizerUser : null)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Сфера деятельности"
                  value={(selectedUser as OrganizerUser).activity_area || ''}
                  onChange={(e) => setSelectedUser(prev => prev ? { 
                    ...prev, 
                    activity_area: e.target.value 
                  } as OrganizerUser : null)}
                  sx={{ mb: 2 }}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditUserDialogOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveUser}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования события */}
      <EventEditDialog
        open={isEditEventDialogOpen}
        onClose={() => setIsEditEventDialogOpen(false)}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        isModerator={true}
      />

      {/* Диалог подтверждения удаления пользователя */}
      <Dialog
        open={isDeleteUserDialogOpen}
        onClose={() => setIsDeleteUserDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteUserDialogOpen(false)}>Отмена</Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ModeratorPage; 
