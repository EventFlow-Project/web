import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { userService } from '../services/userService';
import { Friend } from '../types/User';

interface AddFriendDialogProps {
  open: boolean;
  onClose: () => void;
  onAddFriend: (friendId: string) => void;
}

export const AddFriendDialog: React.FC<AddFriendDialogProps> = ({
  open,
  onClose,
  onAddFriend,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        console.log('Текущий пользователь:', user);
        setCurrentUserId(user.id);
      } catch (error) {
        console.error('Ошибка при получении текущего пользователя:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await userService.searchUsers(searchTerm);
      console.log('Результаты поиска:', results);
      console.log('Текущий ID пользователя:', currentUserId);
      // Фильтруем результаты, чтобы исключить текущего пользователя
      const filteredResults = results.filter(user => {
        console.log('Сравниваем:', user.id, 'с', currentUserId);
        return user.id !== currentUserId;
      });
      console.log('Отфильтрованные результаты:', filteredResults);
      setSearchResults(filteredResults);
    } catch (err) {
      setError('Не удалось выполнить поиск. Попробуйте позже.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = (friendId: string) => {
    console.log('Попытка добавить друга:', friendId);
    console.log('Текущий ID пользователя:', currentUserId);
    if (friendId === currentUserId) {
      console.log('Обнаружена попытка добавить себя в друзья');
      setError('Вы не можете добавить себя в друзья');
      return;
    }
    onAddFriend(friendId);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить друга</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Поиск пользователей"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
          >
            Поиск
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && searchResults.length > 0 && (
          <List>
            {searchResults.map((user) => (
              <ListItem
                key={user.id}
                secondaryAction={
                  <Button
                    variant="outlined"
                    onClick={() => handleAddFriend(user.id)}
                  >
                    Добавить
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar src={user.avatar} alt={user.name} />
                </ListItemAvatar>
                <ListItemText primary={user.name} />
              </ListItem>
            ))}
          </List>
        )}

        {!loading && !error && searchResults.length === 0 && searchTerm && (
          <Typography color="text.secondary" align="center">
            Пользователи не найдены
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}; 