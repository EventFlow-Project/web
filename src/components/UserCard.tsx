import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { User } from '../types/User';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid #e0e0e0',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={user.avatar}
            sx={{
              width: 56,
              height: 56,
              fontSize: '1.5rem'
            }}
          >
            {user.name[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Роль: {user.role}
        </Typography>
        {'description' in user && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {user.description}
          </Typography>
        )}
        {'activity_area' in user && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Сфера деятельности: {user.activity_area}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => onEdit(user)}
        >
          Редактировать
        </Button>
        <Button
          size="small"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(user.id)}
          color="error"
        >
          Удалить
        </Button>
      </CardActions>
    </Card>
  );
};

export default UserCard; 