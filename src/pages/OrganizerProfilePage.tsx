import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  OutlinedInput,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import type { Event } from '../types/Event';
import { Status } from '../types/Event';
import { OrganizerUser, UserRole } from '../types/User';
import { DefaultTag, CustomTag } from '../types/Tag';
import EventList from '../components/EventList';
import SearchAndFilter from '../components/SearchAndFilter';
import EventEditDialog from '../components/EventEditDialog';

// Компонент для создания нового мероприятия
const CreateEventForm: React.FC<{ 
  onClose: () => void;
  handleCreateEvent: (event: Event) => void;
  organizerName: string;
}> = ({ onClose, handleCreateEvent, organizerName }) => {
  const [eventData, setEventData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    duration: '',
    organizer: organizerName,
    status: Status.COMINGUP,
    tags: [],
    location: {
      lat: 0,
      lng: 0,
      address: '',
      image: ''
    },
    image: ''
  });
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedDefaultTags, setSelectedDefaultTags] = useState<DefaultTag[]>([]);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [locationImagePreview, setLocationImagePreview] = useState<string | null>(null);
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEventImage: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEventImage) {
          setEventImagePreview(reader.result as string);
          setEventData(prev => ({ ...prev, image: reader.result as string }));
        } else {
          setLocationImagePreview(reader.result as string);
          setEventData(prev => ({
            ...prev,
            location: { ...prev.location!, image: reader.result as string }
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setEventData(prev => ({ ...prev, title: value }));
      setTitleError('');
    } else {
      setTitleError('Название не должно превышать 20 символов');
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 277) {
      setEventData(prev => ({ ...prev, description: value }));
      setDescriptionError('');
    } else {
      setDescriptionError('Описание не должно превышать 277 символов');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      ...eventData as Event,
      id: Date.now().toString(),
      tags: [...selectedDefaultTags, ...(eventData.tags || [])]
    };
    handleCreateEvent(newEvent);
    onClose();
  };

  const handleTagChange = (event: SelectChangeEvent<DefaultTag[]>) => {
    const value = event.target.value as DefaultTag[];
    setSelectedDefaultTags(value);
    setEventData(prev => ({
      ...prev,
      tags: [...value, ...(prev.tags?.filter((tag): tag is CustomTag => typeof tag !== 'string') || [])]
    }));
  };

  const handleCustomTagAdd = () => {
    if (customTagInput.trim()) {
      const newCustomTag: CustomTag = {
        id: `custom-${Date.now()}`,
        name: customTagInput.trim(),
        isCustom: true
      };
      setEventData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newCustomTag]
      }));
      setCustomTagInput('');
    }
  };

  const handleTagDelete = (tagToDelete: DefaultTag | CustomTag) => {
    if (typeof tagToDelete === 'string') {
      setSelectedDefaultTags(prev => prev.filter(tag => tag !== tagToDelete));
      setEventData(prev => ({
        ...prev,
        tags: prev.tags?.filter(tag => tag !== tagToDelete) || []
      }));
    } else {
      setEventData(prev => ({
        ...prev,
        tags: prev.tags?.filter(tag => 
          typeof tag !== 'string' && tag.id !== tagToDelete.id
        ) || []
      }));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <div>
          <TextField
            required
            fullWidth
            label="Название мероприятия"
            name="title"
            value={eventData.title}
            onChange={handleTitleChange}
            error={!!titleError}
            helperText={titleError || `${eventData.title?.length || 0}/20 символов`}
          />
        </div>
        <div>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            label="Описание"
            name="description"
            value={eventData.description}
            onChange={handleDescriptionChange}
            error={!!descriptionError}
            helperText={descriptionError || `${eventData.description?.length || 0}/277 символов`}
          />
        </div>
        <div>
          <Typography variant="subtitle1" gutterBottom>
            Изображение мероприятия
          </Typography>
          <Button
            variant="contained"
            component="label"
            fullWidth
          >
            Загрузить изображение мероприятия
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleImageChange(e, true)}
            />
          </Button>
          {eventImagePreview && (
            <Box sx={{ mt: 2 }}>
              <img 
                src={eventImagePreview} 
                alt="Event Preview" 
                style={{ maxWidth: '100%', maxHeight: '200px' }} 
              />
            </Box>
          )}
        </div>
        <div>
          <Typography variant="subtitle1" gutterBottom>
            Изображение места проведения
          </Typography>
          <Button
            variant="contained"
            component="label"
            fullWidth
          >
            Загрузить изображение места
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleImageChange(e, false)}
            />
          </Button>
          {locationImagePreview && (
            <Box sx={{ mt: 2 }}>
              <img 
                src={locationImagePreview} 
                alt="Location Preview" 
                style={{ maxWidth: '100%', maxHeight: '200px' }} 
              />
            </Box>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <TextField
              required
              fullWidth
              type="datetime-local"
              label="Дата и время"
              name="date"
              value={eventData.date}
              onChange={(e) => setEventData(prev => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </div>
          <div>
            <TextField
              required
              fullWidth
              label="Продолжительность"
              name="duration"
              value={eventData.duration}
              onChange={(e) => setEventData(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="Например: 2 часа"
            />
          </div>
        </div>
        <div>
          <FormControl fullWidth>
            <InputLabel>Статус мероприятия</InputLabel>
            <Select
              value={eventData.status}
              onChange={(e) => setEventData(prev => ({ ...prev, status: e.target.value as Status }))}
              label="Статус мероприятия"
            >
              <MenuItem value={Status.COMINGUP}>{Status.COMINGUP}</MenuItem>
              <MenuItem value={Status.UNDERWAY}>{Status.UNDERWAY}</MenuItem>
              <MenuItem value={Status.HELD}>{Status.HELD}</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div>
          <TextField
            required
            fullWidth
            label="Адрес"
            name="address"
            value={eventData.location?.address}
            onChange={(e) => setEventData(prev => ({
              ...prev,
              location: { ...prev.location!, address: e.target.value }
            }))}
          />
        </div>
        <div>
          <FormControl fullWidth>
            <InputLabel>Стандартные теги</InputLabel>
            <Select
              multiple
              value={selectedDefaultTags}
              onChange={handleTagChange}
              input={<OutlinedInput label="Стандартные теги" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as DefaultTag[]).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleTagDelete(tag)}
                      onMouseDown={(event) => {
                        event.stopPropagation();
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {Object.values(DefaultTag).map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="Добавить свой тег"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCustomTagAdd();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleCustomTagAdd}
              disabled={!customTagInput.trim()}
            >
              Добавить
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {eventData.tags?.filter((tag): tag is CustomTag => typeof tag !== 'string').map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                onDelete={() => handleTagDelete(tag)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </div>
      </div>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button type="submit" variant="contained" sx={{ ml: 1 }}>
          Создать
        </Button>
      </Box>
    </Box>
  );
};

// Основной компонент страницы профиля организатора
const OrganizerProfilePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [mockUser, setMockUser] = useState<OrganizerUser>({
    id: '1',
    email: 'org@example.com',
    name: 'Организатор мероприятий',
    role: UserRole.ORGANIZER,
    description: 'Мы организуем лучшие мероприятия в городе',
    activity_area: 'Организация конференций и фестивалей',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    events: [],
    avatar: '',
    activityArea: 'Организация конференций и фестивалей'
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  const handleCreateEvent = (newEvent: Event) => {
    setEvents(prev => [...prev, newEvent]);
    setFilteredEvents(prev => [...prev, newEvent]);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // При смене вкладки обновляем отфильтрованные события
    const eventsToFilter = events;
    let filteredByStatus = eventsToFilter;
    
    switch (newValue) {
      case 1: // Предстоящие
        filteredByStatus = eventsToFilter.filter(event => event.status === Status.COMINGUP);
        break;
      case 2: // Текущие
        filteredByStatus = eventsToFilter.filter(event => event.status === Status.UNDERWAY);
        break;
      case 3: // Прошедшие
        filteredByStatus = eventsToFilter.filter(event => event.status === Status.HELD);
        break;
      default: // Все
        break;
    }
    
    setFilteredEvents(filteredByStatus);
  };

  const handleFilterChange = (filtered: Event[]) => {
    // Применяем фильтр поиска к текущему списку событий
    setFilteredEvents(filtered);
  };

  const handleResetSelection = () => {
    setSelectedEvent(null);
    // При сбросе возвращаемся к списку событий текущей вкладки
    const eventsToFilter = events;
    let filteredByStatus = eventsToFilter;
    
    switch (tabValue) {
      case 1: // Предстоящие
        filteredByStatus = eventsToFilter.filter(event => event.status === Status.COMINGUP);
        break;
      case 2: // Текущие
        filteredByStatus = eventsToFilter.filter(event => event.status === Status.UNDERWAY);
        break;
      case 3: // Прошедшие
        filteredByStatus = eventsToFilter.filter(event => event.status === Status.HELD);
        break;
      default: // Все
        break;
    }
    
    setFilteredEvents(filteredByStatus);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMockUser(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = (updatedUser: OrganizerUser) => {
    setMockUser(updatedUser);
    setIsEditDialogOpen(false);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
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
    setIsEditDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setFilteredEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 15, mb: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Информация об организаторе */}
          <div>
            <Paper 
              sx={{ 
                p: 3,
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={mockUser.avatar}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mb: 2,
                      border: '2px solid #e0e0e0'
                    }}
                  />
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      height: '30px',
                      width: '30px',
                      backgroundColor: 'white',
                      border: '2px solid #e0e0e0',
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <AddIcon />
                  </IconButton>
                </Box>
                <Typography variant="h5">{mockUser.name}</Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditProfile}
                  sx={{ mt: 2 }}
                >
                  Редактировать профиль
                </Button>
              </Box>
              <Typography variant="body1" paragraph>
                {mockUser.description}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Сфера деятельности:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mockUser.activityArea}
              </Typography>
            </Paper>
          </div>

          {/* Основной контент */}
          <div>
            <Paper 
              sx={{ 
                p: 3,
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Мои мероприятия</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Создать мероприятие
                </Button>
              </Box>

              <Box sx={{ mb: 3 }}>
                <SearchAndFilter 
                  events={filteredEvents} 
                  onFilterChange={handleFilterChange}
                  selectedEvent={selectedEvent}
                  onResetSelection={handleResetSelection}
                />
              </Box>

              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label="Все" />
                <Tab label="Предстоящие" />
                <Tab label="Текущие" />
                <Tab label="Прошедшие" />
              </Tabs>

              <EventList 
                events={filteredEvents} 
                itemCountColumn={2} 
                onEventClick={handleEditEvent}
              />
            </Paper>
          </div>
        </div>

        {/* Диалог создания мероприятия */}
        <Dialog 
          open={isCreateDialogOpen} 
          onClose={() => setIsCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              maxHeight: '90vh',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle>
            Создание нового мероприятия
            <IconButton
              aria-label="close"
              onClick={() => setIsCreateDialogOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent 
            sx={{ 
              overflowY: 'auto', 
              padding: '20px',
              '&:focus': {
                outline: 'none'
              }
            }}
            onWheel={(e) => {
              e.stopPropagation();
              const target = e.currentTarget;
              target.scrollTop += e.deltaY;
            }}
          >
            <CreateEventForm 
              onClose={() => setIsCreateDialogOpen(false)} 
              handleCreateEvent={handleCreateEvent}
              organizerName={mockUser.name}
            />
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования профиля */}
        <Dialog 
          open={isEditDialogOpen} 
          onClose={() => setIsEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Редактирование профиля
            <IconButton
              aria-label="close"
              onClick={() => setIsEditDialogOpen(false)}
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
                label="Название организации"
                value={mockUser.name}
                onChange={(e) => setMockUser(prev => ({ ...prev, name: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Описание"
                value={mockUser.description}
                onChange={(e) => setMockUser(prev => ({ ...prev, description: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Сфера деятельности"
                value={mockUser.activityArea}
                onChange={(e) => setMockUser(prev => ({ ...prev, activityArea: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
            <Button 
              variant="contained" 
              onClick={() => handleSaveProfile(mockUser)}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог редактирования мероприятия */}
        <EventEditDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          event={selectedEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      </Box>
    </Container>
  );
};

export default OrganizerProfilePage; 