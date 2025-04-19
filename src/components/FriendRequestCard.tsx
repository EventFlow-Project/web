import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { Friend } from '../types/User';

interface FriendRequestCardProps {
  request: Friend;
  onAccept: (userId: string) => void;
  onReject: (userId: string) => void;
}

export const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  request,
  onAccept,
  onReject,
}) => {
  return (
    <Card sx={{ maxWidth: 300, m: 1 }}>
      <CardMedia
        component="img"
        height="200"
        image={request.avatar || 'https://i.pravatar.cc/300'}
        alt={request.displayName}
      />
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {request.displayName}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onReject(request.id)}
          >
            Отклонить
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => onAccept(request.id)}
          >
            Принять
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 