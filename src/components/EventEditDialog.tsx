import React, { useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Event, Status } from '../types/Event';
import { DefaultTag, CustomTag } from '../types/Tag';

interface EventEditDialogProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  onSave: (event: Event) => void;
  onDelete: () => void;
}

const EventEditDialog: React.FC<EventEditDialogProps> = ({
  open,
  onClose,
  event,
  onSave,
  onDelete,
}) => {
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const [editedEvent, setEditedEvent] = useState<Event | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedDefaultTags, setSelectedDefaultTags] = useState<DefaultTag[]>([]);

  useEffect(() => {
    if (event) {
      setEditedEvent(event);
      const defaultTags = event.tags.filter((tag): tag is DefaultTag => typeof tag === 'string');
      setSelectedDefaultTags(defaultTags);
    }
  }, [event]);

  if (!editedEvent) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedEvent(prev => prev ? {
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
    setEditedEvent(prev => prev ? {
      ...prev,
      ...(isFront ? { image: undefined } : {
        location: {
          ...prev.location,
          image: undefined
        }
      })
    } : null);
  };

  const handleFieldChange = (field: keyof Event) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedEvent(prev => prev ? {
      ...prev,
      [field]: e.target.value
    } : null);
  };

  const handleLocationChange = (field: keyof Event['location']) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedEvent(prev => prev ? {
      ...prev,
      location: {
        ...prev.location,
        [field]: e.target.value
      }
    } : null);
  };

  const handleTagChange = (event: SelectChangeEvent<DefaultTag[]>) => {
    const value = event.target.value as DefaultTag[];
    setSelectedDefaultTags(value);
    setEditedEvent(prev => prev ? {
      ...prev,
      tags: [...value, ...prev.tags.filter((tag): tag is CustomTag => typeof tag !== 'string')]
    } : null);
  };

  const handleCustomTagAdd = () => {
    if (customTagInput.trim()) {
      const newCustomTag: CustomTag = {
        id: `custom-${Date.now()}`,
        name: customTagInput.trim(),
        isCustom: true
      };
      setEditedEvent(prev => prev ? {
        ...prev,
        tags: [...prev.tags, newCustomTag]
      } : null);
      setCustomTagInput('');
    }
  };

  const handleTagDelete = (tagToDelete: DefaultTag | CustomTag) => {
    if (typeof tagToDelete === 'string') {
      setSelectedDefaultTags(prev => prev.filter(tag => tag !== tagToDelete));
      setEditedEvent(prev => prev ? {
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToDelete)
      } : null);
    } else {
      setEditedEvent(prev => prev ? {
        ...prev,
        tags: prev.tags.filter(tag => 
          typeof tag === 'string' || tag.id !== tagToDelete.id
        )
      } : null);
    }
  };

  const handleSave = () => {
    if (editedEvent) {
      onSave(editedEvent);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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
        Редактирование мероприятия
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <DeleteIcon />
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {/* Переднее изображение */}
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Передняя сторона</Typography>
              {editedEvent.image ? (
                <>
                  <img 
                    src={editedEvent.image} 
                    alt="Передняя сторона" 
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }} 
                  />
                  <IconButton
                    onClick={() => handleImageDelete(true)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '200px',
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                  onClick={() => frontFileInputRef.current?.click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    Нажмите для загрузки передней стороны
                  </Typography>
                </Box>
              )}
              <input
                type="file"
                accept="image/*"
                ref={frontFileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => handleImageUpload(e, true)}
              />
            </Box>

            {/* Заднее изображение */}
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Задняя сторона</Typography>
              {editedEvent.location.image ? (
                <>
                  <img 
                    src={editedEvent.location.image} 
                    alt="Задняя сторона" 
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }} 
                  />
                  <IconButton
                    onClick={() => handleImageDelete(false)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '200px',
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                  onClick={() => backFileInputRef.current?.click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    Нажмите для загрузки задней стороны
                  </Typography>
                </Box>
              )}
              <input
                type="file"
                accept="image/*"
                ref={backFileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => handleImageUpload(e, false)}
              />
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Название"
            value={editedEvent.title}
            onChange={handleFieldChange('title')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Описание"
            value={editedEvent.description}
            onChange={handleFieldChange('description')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="Дата и время"
            value={editedEvent.date}
            onChange={handleFieldChange('date')}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Продолжительность"
            value={editedEvent.duration}
            onChange={handleFieldChange('duration')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Организатор"
            value={editedEvent.organizer}
            onChange={handleFieldChange('organizer')}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={editedEvent.status}
              label="Статус"
              onChange={(e) => setEditedEvent(prev => prev ? { ...prev, status: e.target.value as Status } : null)}
            >
              <MenuItem value={Status.COMINGUP}>Предстоящее</MenuItem>
              <MenuItem value={Status.UNDERWAY}>Текущее</MenuItem>
              <MenuItem value={Status.HELD}>Прошедшее</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Адрес"
            value={editedEvent.location.address}
            onChange={handleLocationChange('address')}
            sx={{ mb: 2 }}
          />

          {/* Теги */}
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

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {editedEvent.tags.filter((tag): tag is CustomTag => typeof tag !== 'string').map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                onDelete={() => handleTagDelete(tag)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          color="error" 
          onClick={onDelete}
          startIcon={<DeleteIcon />}
        >
          Удалить
        </Button>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventEditDialog; 