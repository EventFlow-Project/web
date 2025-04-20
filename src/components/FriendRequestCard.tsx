import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
} from '@mui/material';
import { Friend } from '../types/User';
import PersonIcon from '@mui/icons-material/Person';

interface FriendRequestCardProps {
  friend: Friend;
  onAccept: (userId: string) => void;
  onReject: (userId: string) => void;
}

export const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  friend,
  onAccept,
  onReject,
}) => {
  return (
    <Card sx={{ maxWidth: 300, m: 1 }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
        bgcolor: 'grey.100',
        p: 2
      }}>
        <Avatar
          src={friend.avatar}
          alt={friend.name}
          sx={{
            width: 120,
            height: 120,
            bgcolor: 'grey.300'
          }}
        >
          <PersonIcon sx={{ fontSize: 60 }} />
        </Avatar>
      </Box>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {friend.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onAccept(friend.id)}
          >
            Принять
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onReject(friend.id)}
          >
            Отклонить
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 