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
import { User, UserRole } from '../types/User';

interface UserSearchAndFilterProps {
  users: User[];
  onFilterChange: (filteredUsers: User[]) => void;
  selectedUser: User | null;
  onResetSelection: () => void;
}

const UserSearchAndFilter: React.FC<UserSearchAndFilterProps> = (props) => {
  const { users, onFilterChange, selectedUser, onResetSelection } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterUsers(value, selectedRoles);
  };

  const handleRoleChange = (event: SelectChangeEvent<UserRole[]>) => {
    const value = event.target.value as UserRole[];
    setSelectedRoles(value);
    filterUsers(searchTerm, value);
    updateActiveFiltersCount(value);
  };

  const updateActiveFiltersCount = (roles: UserRole[]) => {
    setActiveFiltersCount(roles.length);
  };

  const filterUsers = (
    search: string,
    roles: UserRole[]
  ) => {
    let filtered = [...users];

    // Поиск по имени, email и описанию
    if (search) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.role === UserRole.ORGANIZER && 
            (user as any).description?.toLowerCase().includes(searchLower))
      );
    }

    // Фильтр по ролям
    if (roles.length > 0) {
      filtered = filtered.filter(user => roles.includes(user.role));
    }

    onFilterChange(filtered);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedRoles([]);
    setSearchTerm('');
    updateActiveFiltersCount([]);
    filterUsers('', []);
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
        {selectedUser ? (
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
              <InputLabel>Роли</InputLabel>
              <Select
                multiple
                value={selectedRoles}
                onChange={handleRoleChange}
                input={<OutlinedInput label="Роли" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((role) => (
                      <Chip
                        key={role}
                        label={role === UserRole.ADMIN ? 'Администратор' : 
                               role === UserRole.ORGANIZER ? 'Организатор' : 'Участник'}
                        onDelete={() => {
                          const newRoles = selectedRoles.filter(r => r !== role);
                          setSelectedRoles(newRoles);
                          filterUsers(searchTerm, newRoles);
                          updateActiveFiltersCount(newRoles);
                        }}
                      />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value={UserRole.ADMIN}>Администратор</MenuItem>
                <MenuItem value={UserRole.ORGANIZER}>Организатор</MenuItem>
                <MenuItem value={UserRole.PARTICIPANT}>Участник</MenuItem>
              </Select>
            </FormControl>
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

export default UserSearchAndFilter; 