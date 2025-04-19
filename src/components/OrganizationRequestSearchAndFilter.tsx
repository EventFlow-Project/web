
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
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { OrganizationRequest } from '../pages/ModeratorProfilePage';

interface OrganizationRequestSearchAndFilterProps {
  requests: OrganizationRequest[];
  onFilterChange: (filteredRequests: OrganizationRequest[]) => void;
  selectedRequest: OrganizationRequest | null;
  onResetSelection: () => void;
}

const OrganizationRequestSearchAndFilter: React.FC<OrganizationRequestSearchAndFilterProps> = (props) => {
  const { requests, onFilterChange, selectedRequest, onResetSelection } = props;
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterRequests(value);
  };

  const filterRequests = (search: string) => {
    let filtered = [...requests];

    // Поиск по названию организации, email и описанию
    if (search) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        request =>
          request.name.toLowerCase().includes(searchLower) ||
          request.email.toLowerCase().includes(searchLower) ||
          request.description.toLowerCase().includes(searchLower) ||
          request.activityArea.toLowerCase().includes(searchLower)
      );
    }

    onFilterChange(filtered);
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
        {selectedRequest && (
          <Button
            variant="outlined"
            onClick={onResetSelection}
            sx={{ minWidth: '120px', height: '56px', whiteSpace: 'nowrap' }}
          >
            Показать все
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default OrganizationRequestSearchAndFilter; 