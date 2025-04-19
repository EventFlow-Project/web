import React, { useState, useRef } from 'react';
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
import { UserRole, User, AdminUser, OrganizerUser, ParticipantUser, isParticipant } from '../types/User';
import { Event, Status } from '../types/Event';
import OrganizationRequestSearchAndFilter from '../components/OrganizationRequestSearchAndFilter';
import UserSearchAndFilter from '../components/UserSearchAndFilter';
import SearchAndFilter from '../components/SearchAndFilter';
import EventList from '../components/EventList';
import EventEditDialog from '../components/EventEditDialog';
import UserCard from '../components/UserCard';

export interface OrganizationRequest extends OrganizerUser {
  isApproved: boolean;
}

const ModeratorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isCreateAdminDialogOpen, setIsCreateAdminDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<OrganizationRequest | null>(null);
  const [adminData, setAdminData] = useState<Pick<AdminUser, 'email' | 'name'> & { password: string }>({
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
      activityArea: 'Сфера деятельности 1',
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
      activityArea: 'Сфера деятельности 2',
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
      activityArea: 'Сфера деятельности 1',
      events: [],
      avatar: '',
      activity_area: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as OrganizerUser,
  ]);

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Мероприятие 1',
      description: 'Описание мероприятия 1',
      date: '2024-03-20T10:00',
      duration: '2 часа',
      organizer: 'Организатор 1',
      status: Status.COMINGUP,
      location: {
        lat: 0,
        lng: 0,
        address: 'Адрес 1',
        image: '',
      },
      tags: [],
    },
  ]);

  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  const handleUserFilterChange = (filtered: User[]) => {
    setFilteredUsers(filtered);
  };

  const handleUserResetSelection = () => {
    setSelectedUser(null);
    setFilteredUsers(users);
  };

  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);

  const handleEventFilterChange = (filtered: Event[]) => {
    setFilteredEvents(filtered);
  };

  const handleEventResetSelection = () => {
    setSelectedEvent(null);
    setFilteredEvents(events);
  };

  const handleCreateAdmin = () => {
    // Здесь будет логика создания администратора
    console.log('Creating admin:', adminData);
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
      activityArea: requestToApprove.activityArea,
      events: [],
      avatar: '',
      activity_area: requestToApprove.activityArea,
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
    if (selectedUser) {
      setUsers(prev =>
        prev.map(user =>
          user.id === selectedUser.id ? selectedUser : user
        )
      );
      setIsEditUserDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleSaveEvent = (updatedEvent: Event) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setFilteredEvents(prev =>
      prev.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setIsEditEventDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setFilteredEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setIsEditEventDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleDeleteUser = (userId: string) => {
    // TODO: Implement user deletion
    console.log('Delete user:', userId);
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            onClick={() => setIsCreateAdminDialogOpen(true)}
          >
            Создать администратора
          </Button>
        </Box>

        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Заявки организаций" />
          <Tab label="Пользователи" />
          <Tab label="Мероприятия" />
        </Tabs>

        {activeTab === 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Заявки на регистрацию организаций
            </Typography>
            <Box sx={{ mb: 3 }}>
              <OrganizationRequestSearchAndFilter 
                requests={organizationRequests}
                onFilterChange={handleFilterChange}
                selectedRequest={selectedRequest}
                onResetSelection={handleResetSelection}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {filteredRequests.map((org) => (
                <Box key={org.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' } }}>
                  <Card sx={{ 
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <CardContent>
                      <Typography variant="h6">{org.name}</Typography>
                      <Typography color="textSecondary">{org.email}</Typography>
                      <Typography color="textSecondary">{org.description}</Typography>
                      <Typography color="textSecondary">Область деятельности: {org.activityArea}</Typography>
                      <Typography color="textSecondary">Статус: {org.isApproved ? 'Одобрено' : 'На рассмотрении'}</Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        {!org.isApproved && (
                          <>
                            <Button 
                              variant="contained" 
                              color="primary" 
                              onClick={() => handleApproveOrganization(org.id)}
                            >
                              Одобрить
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              onClick={() => handleRejectOrganization(org.id)}
                            >
                              Отклонить
                            </Button>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </>
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
          <>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Мероприятия
            </Typography>
            <Box sx={{ mb: 3 }}>
              <SearchAndFilter 
                events={events}
                onFilterChange={handleEventFilterChange}
                selectedEvent={selectedEvent}
                onResetSelection={handleEventResetSelection}
              />
            </Box>
            <EventList events={filteredEvents} itemCountColumn={3} onEventClick={handleEditEvent} />
          </>
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
                      let updatedUser: AdminUser | OrganizerUser | ParticipantUser;
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
                            activityArea: '',
                            events: []
                          } as OrganizerUser;
                          break;
                        case UserRole.ADMIN:
                          updatedUser = {
                            ...selectedUser,
                            role: UserRole.ADMIN
                          } as AdminUser;
                          break;
                        default:
                          updatedUser = selectedUser as AdminUser | OrganizerUser | ParticipantUser;
                      }
                      setSelectedUser(updatedUser);
                    }
                  }}
                >
                  <MenuItem value={UserRole.PARTICIPANT}>Участник</MenuItem>
                  <MenuItem value={UserRole.ORGANIZER}>Организатор</MenuItem>
                  <MenuItem value={UserRole.ADMIN}>Администратор</MenuItem>
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
                    value={(selectedUser as OrganizerUser).activityArea || ''}
                    onChange={(e) => setSelectedUser(prev => prev ? { 
                      ...prev, 
                      activityArea: e.target.value 
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

        {/* Диалог редактирования мероприятия */}
        <EventEditDialog
          open={isEditEventDialogOpen}
          onClose={() => setIsEditEventDialogOpen(false)}
          event={selectedEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      </Box>
    </Container>
  );
};

export default ModeratorPage; 
