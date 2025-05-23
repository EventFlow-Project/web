import React, { useState, useRef, useEffect } from 'react';
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
  Popover,
  SxProps,
  Theme,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import type { Event } from '../types/Event';
import { Status, ModerationStatus } from '../types/Event';
import { OrganizerUser, UserRole, Friend } from '../types/User';
import { DefaultTag, CustomTag, DEFAULT_CUSTOM_TAG_COLOR } from '../types/Tag';
import EventList from '../components/EventList';
import SearchAndFilter from '../components/SearchAndFilter';
import EventEditDialog from '../components/EventEditDialog';
import ColorPicker from '../components/ColorPicker';
import { geocodeAddress } from '../services/geocodingService';
import { eventService } from '../services/eventService';
import { userService } from '../services/userService';
import { debounce } from 'lodash';
import { mockOrganizer, mockEvents } from '../mocks/organizerData';
import EventStatsComponent from '../components/EventStats';


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
  const [customTagColor, setCustomTagColor] = useState(DEFAULT_CUSTOM_TAG_COLOR);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLButtonElement | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [locationImagePreview, setLocationImagePreview] = useState<string | null>(null);
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const colorWheelRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [colorInput, setColorInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [addressInput, setAddressInput] = useState('');

  // Создаем дебаунсированную функцию для геокодирования
  const debouncedGeocode = useRef(
    debounce(async (address: string) => {
      if (!address.trim()) {
        setGeocodingError('');
        return;
      }

      setIsGeocoding(true);
      setGeocodingError('');

      try {
        const coordinates = await geocodeAddress(address);
        if (coordinates) {
          setEventData(prev => ({
            ...prev,
            location: { ...prev.location!, ...coordinates }
          }));
          setGeocodingError('');
        } else {
          setGeocodingError('Не удалось определить координаты для указанного адреса');
        }
      } catch (error) {
        console.error('Error during geocoding:', error);
        setGeocodingError('Ошибка при определении координат');
      } finally {
        setIsGeocoding(false);
      }
    }, 1000)
  ).current;

  // Очищаем таймер при размонтировании компонента
  useEffect(() => {
    return () => {
      debouncedGeocode.cancel();
    };
  }, [debouncedGeocode]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, isEventImage: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        // Конвертируем файл в base64 строку
        const base64String = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64);
          };
          reader.readAsDataURL(file);
        });
        
        // Загружаем изображение на сервер
        const imageUrl = await eventService.uploadEventImage(base64String);
        
        if (isEventImage) {
          setEventImagePreview(imageUrl);
          setEventData(prev => ({ ...prev, image: imageUrl }));
        } else {
          setLocationImagePreview(imageUrl);
          setEventData(prev => ({
            ...prev,
            location: { ...prev.location!, image: imageUrl }
          }));
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        // Здесь можно добавить обработку ошибок, например, показ уведомления
      } finally {
        setIsUploading(false);
      }
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
    if (value.length <= 254) {
      setEventData(prev => ({ ...prev, description: value }));
      setDescriptionError('');
    } else {
      setDescriptionError('Описание не должно превышать 254 символов');
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddressInput(newAddress);
    setEventData(prev => ({
      ...prev,
      location: { ...prev.location!, address: newAddress }
    }));
    debouncedGeocode(newAddress);
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
        isCustom: true,
        color: customTagColor
      };
      setEventData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newCustomTag]
      }));
      setCustomTagInput('');
      setCustomTagColor(DEFAULT_CUSTOM_TAG_COLOR);
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

  const handleColorPickerOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
  };

  const handleColorChange = (color: string) => {
    setCustomTagColor(color);
  };

  useEffect(() => {
    setColorInput(customTagColor);
  }, [customTagColor]);

  const colorButtonStyle: SxProps<Theme> = {
    backgroundColor: customTagColor,
    minWidth: '56px',
    height: '56px',
    '&:hover': {
      backgroundColor: customTagColor,
      opacity: 0.8
    }
  };

  const isFormValid = () => {
    return (
      eventData.title &&
      eventData.description &&
      eventData.date &&
      eventData.duration &&
      eventData.location?.address &&
      eventData.location?.lat !== 0 &&
      eventData.location?.lng !== 0 &&
      !isGeocoding &&
      !geocodingError
    );
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
            helperText={descriptionError || `${eventData.description?.length || 0}/254 символов`}
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
            disabled={isUploading}
          >
            {isUploading ? 'Загрузка...' : 'Загрузить изображение мероприятия'}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleImageChange(e, true)}
              disabled={isUploading}
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
            disabled={isUploading}
          >
            {isUploading ? 'Загрузка...' : 'Загрузить изображение места'}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleImageChange(e, false)}
              disabled={isUploading}
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
            value={addressInput}
            onChange={handleAddressChange}
            error={!!geocodingError}
            helperText={geocodingError || (isGeocoding ? 'Определение координат...' : '')}
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
            <Tooltip title="Выбрать цвет">
              <Button
                variant="outlined"
                onClick={handleColorPickerOpen}
                sx={{
                  ...colorButtonStyle,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: customTagColor,
                    border: '2px solid white',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                  }
                }}
              />
            </Tooltip>
            <Button
              variant="contained"
              onClick={handleCustomTagAdd}
              disabled={!customTagInput.trim()}
            >
              Добавить
            </Button>
          </Box>

          <ColorPicker
            anchorEl={colorPickerAnchor}
            onClose={handleColorPickerClose}
            color={customTagColor}
            onChange={handleColorChange}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {eventData.tags?.filter((tag): tag is CustomTag => typeof tag !== 'string').map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                onDelete={() => handleTagDelete(tag)}
                sx={{
                  color: tag.color || DEFAULT_CUSTOM_TAG_COLOR,
                  borderColor: tag.color || DEFAULT_CUSTOM_TAG_COLOR,
                  '& .MuiChip-deleteIcon': {
                    color: tag.color || DEFAULT_CUSTOM_TAG_COLOR,
                    '&:hover': {
                      color: tag.color || DEFAULT_CUSTOM_TAG_COLOR,
                      opacity: 0.7,
                    }
                  }
                }}
                variant="outlined"
              />
            ))}
          </Box>
        </div>
      </div>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ ml: 1 }}
          disabled={!isFormValid()}
        >
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
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [organizer, setOrganizer] = useState<OrganizerUser>(mockOrganizer);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleCreateEvent = async (newEvent: Event) => {
    try {
      // В реальном приложении здесь был бы вызов API
      const createdEvent = {
        ...newEvent,
        id: Date.now().toString(),
        moderationStatus: ModerationStatus.PENDING
      };
      setEvents(prev => [...prev, createdEvent]);
      setFilteredEvents(prev => [...prev, createdEvent]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleSaveEvent = async (updatedEvent: Event) => {
    try {
      // В реальном приложении здесь был бы вызов API
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
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        // В реальном приложении здесь был бы вызов API
        setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
        setFilteredEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
        setIsEditDialogOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleSaveProfile = async (updatedOrganizer: OrganizerUser) => {
    try {
      // В реальном приложении здесь был бы вызов API
      setOrganizer(updatedOrganizer);
      setIsEditProfileDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && organizer) {
      try {
        setIsUploading(true);
        // В реальном приложении здесь был бы вызов API для загрузки изображения
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setOrganizer(prev => ({
            ...prev,
            avatar: base64
          }));
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error updating avatar:', error);
        setIsUploading(false);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // При смене вкладки обновляем отфильтрованные события только если это не вкладка статистики
    if (newValue !== 4) { // 4 - индекс вкладки статистики
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
    }
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

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleToggleFavorite = (eventId: string) => {
    setFavoriteEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleInviteFriend = (eventId: string, friendId: string) => {
    // TODO: Implement friend invitation logic
    console.log('Invite friend:', friendId, 'to event:', eventId);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 15, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Typography>Загрузка...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 15, mb: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
          {/* Информация об организаторе */}
          <div style={{ width: '400px', flexShrink: 0 }}>
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
                    src={organizer.avatar}
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
                <Typography variant="h5">{organizer.name}</Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditProfileDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Редактировать профиль
                </Button>
              </Box>
              <Typography variant="body1" paragraph>
                {organizer.description}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Сфера деятельности:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {organizer.activity_area}
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
                {tabValue !== 4 && ( // Показываем кнопку создания только если не на вкладке статистики
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    Создать мероприятие
                  </Button>
                )}
              </Box>

              {tabValue !== 4 && ( // Показываем поиск и фильтры только если не на вкладке статистики
                <Box sx={{ mb: 3 }}>
                  <SearchAndFilter 
                    events={filteredEvents} 
                    onFilterChange={handleFilterChange}
                    selectedEvent={selectedEvent}
                    onResetSelection={handleResetSelection}
                    isOrganizer={true}
                  />
                </Box>
              )}

              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label="Все" />
                <Tab label="Предстоящие" />
                <Tab label="Текущие" />
                <Tab label="Прошедшие" />
                <Tab label="Статистика" />
              </Tabs>

              {tabValue === 4 ? (
                <EventStatsComponent />
              ) : (
                <EventList 
                  events={filteredEvents} 
                  itemCountColumn={2}
                  onEventClick={handleEditEvent}
                  favoriteEvents={favoriteEvents}
                  onToggleFavorite={handleToggleFavorite}
                  friends={friends}
                  onInviteFriend={handleInviteFriend}
                  showModerationStatus={true}
                />
              )}
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
              organizerName={organizer.name}
            />
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования профиля */}
        <Dialog 
          open={isEditProfileDialogOpen} 
          onClose={() => setIsEditProfileDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Редактирование профиля
            <IconButton
              aria-label="close"
              onClick={() => setIsEditProfileDialogOpen(false)}
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
                value={organizer.name}
                onChange={(e) => {
                  const updatedOrganizer: OrganizerUser = {
                    ...organizer,
                    name: e.target.value
                  };
                  setOrganizer(updatedOrganizer);
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Описание"
                value={organizer.description}
                onChange={(e) => {
                  const updatedOrganizer: OrganizerUser = {
                    ...organizer,
                    description: e.target.value
                  };
                  setOrganizer(updatedOrganizer);
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Сфера деятельности"
                value={organizer.activity_area}
                onChange={(e) => {
                  const updatedOrganizer: OrganizerUser = {
                    ...organizer,
                    activity_area: e.target.value
                  };
                  setOrganizer(updatedOrganizer);
                }}
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditProfileDialogOpen(false)}>Отмена</Button>
            <Button 
              variant="contained" 
              onClick={() => handleSaveProfile(organizer)}
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