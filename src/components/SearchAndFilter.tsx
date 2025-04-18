import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { DefaultTag, CustomTag, Tag } from '../types/Tag';
import { Event } from '../types/Event';

interface SearchAndFilterProps {
  events: Event[];
  onFilterChange: (filteredEvents: Event[]) => void;
  selectedEvent: Event | null;
  onResetSelection: () => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = (props) => {
  const { events, onFilterChange, selectedEvent, onResetSelection } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterEvents(value, selectedTags, dateRange);
  };

  const handleTagChange = (event: SelectChangeEvent<DefaultTag[]>) => {
    const value = event.target.value as DefaultTag[];
    const newTags = [...selectedTags.filter(tag => typeof tag !== 'string'), ...value];
    setSelectedTags(newTags);
    filterEvents(searchTerm, newTags, dateRange);
    updateActiveFiltersCount(newTags, dateRange);
  };

  const handleCustomTagAdd = (newValue: string | null) => {
    if (newValue) {
      const newCustomTag: CustomTag = {
        id: `custom-${Date.now()}`,
        name: newValue.trim(),
        isCustom: true
      };
      const newTags = [...selectedTags, newCustomTag];
      setSelectedTags(newTags);
      setCustomTagInput('');
      filterEvents(searchTerm, newTags, dateRange);
      updateActiveFiltersCount(newTags, dateRange);
    }
  };

  const handleTagDelete = (tagToDelete: Tag) => {
    const newSelectedTags = selectedTags.filter(tag => 
      typeof tag === 'string' 
        ? tag !== tagToDelete 
        : tag.id !== (tagToDelete as CustomTag).id
    );
    setSelectedTags(newSelectedTags);
    filterEvents(searchTerm, newSelectedTags, dateRange);
    updateActiveFiltersCount(newSelectedTags, dateRange);
  };

  const handleDateRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDateRange(value);
    filterEvents(searchTerm, selectedTags, value);
    updateActiveFiltersCount(selectedTags, value);
  };

  const updateActiveFiltersCount = (tags: Tag[], date: string) => {
    let count = 0;
    if (tags.length > 0) count += 1;
    if (date) count += 1;
    setActiveFiltersCount(count);
  };

  const filterEvents = (
    search: string,
    tags: Tag[],
    dateRangeValue: string
  ) => {
    // Всегда начинаем с оригинального массива событий
    let filtered = [...events];

    // Поиск по названию и организаторам
    if (search) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(searchLower) ||
          event.organizer.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по тегам
    if (tags.length > 0) {
      filtered = filtered.filter(event =>
        event.tags.some(eventTag => {
          return tags.some(selectedTag => {
            if (typeof selectedTag === 'string' && typeof eventTag === 'string') {
              return selectedTag === eventTag;
            } else if (typeof selectedTag !== 'string' && typeof eventTag !== 'string') {
              return selectedTag.id === eventTag.id || selectedTag.name.toLowerCase() === eventTag.name.toLowerCase();
            }
            return false;
          });
        })
      );
    }

    // Фильтр по диапазону дат
    if (dateRangeValue) {
      const [year, month] = dateRangeValue.split('-').map(Number);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month;
      });
    }

    // Убедимся, что у нас нет дубликатов перед отправкой
    const uniqueFiltered = filtered.filter((event, index, self) =>
      index === self.findIndex((e) => e.id === event.id)
    );

    onFilterChange(uniqueFiltered);
  };

  const getSelectedDefaultTags = (): DefaultTag[] => {
    return selectedTags.filter(tag => typeof tag === 'string') as DefaultTag[];
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setDateRange('');
    setCustomTagInput('');
    updateActiveFiltersCount([], '');
    filterEvents(searchTerm, [], '');
  };

  return (
    <Box sx={{ height: '56px', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        <TextField
          fullWidth
          placeholder="Поиск"
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        {selectedEvent ? (
          <Button
            variant="outlined"
            onClick={onResetSelection}
            sx={{ minWidth: '120px', height: '56px', whiteSpace: 'nowrap' }}
          >
            Показать все
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={() => setIsFilterOpen(true)}
            startIcon={<FilterListIcon />}
            sx={{ minWidth: '120px', position: 'relative', height: '56px' }}
          >
            Фильтры
            {activeFiltersCount > 0 && (
              <Chip
                size="small"
                label={activeFiltersCount}
                color="primary"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  height: '20px',
                  minWidth: '20px'
                }}
              />
            )}
          </Button>
        )}
      </Box>

      <Dialog
        open={isFilterOpen}
        onClose={handleCloseFilter}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Фильтры
          <IconButton
            aria-label="close"
            onClick={handleCloseFilter}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Стандартные теги</InputLabel>
              <Select
                multiple
                value={getSelectedDefaultTags()}
                onChange={handleTagChange}
                input={<OutlinedInput label="Стандартные теги" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as DefaultTag[]).map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleTagDelete(tag)}
                        onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => {
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
                inputProps={{
                  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && customTagInput.trim()) {
                      e.preventDefault();
                      handleCustomTagAdd(customTagInput);
                      setCustomTagInput('');
                    }
                  }
                }}
                variant="outlined"
              />
              <Button
                variant="contained"
                onClick={() => {
                  if (customTagInput.trim()) {
                    handleCustomTagAdd(customTagInput);
                    setCustomTagInput('');
                  }
                }}
                disabled={!customTagInput.trim()}
                sx={{ height: '56px' }}
              >
                Добавить
              </Button>
            </Box>

            {selectedTags.some(tag => typeof tag !== 'string') && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedTags.filter(tag => typeof tag !== 'string').map((tag) => (
                  <Chip
                    key={(tag as CustomTag).id}
                    label={(tag as CustomTag).name}
                    onDelete={() => handleTagDelete(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            <TextField
              fullWidth
              label="Выберите месяц"
              type="month"
              value={dateRange}
              onChange={handleDateRangeChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClearFilters}
            color="error"
            disabled={activeFiltersCount === 0}
          >
            Очистить фильтры
          </Button>
          <Box sx={{ flex: '1 0 0' }} />
          <Button onClick={handleCloseFilter}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SearchAndFilter; 