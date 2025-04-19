import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { Event } from '../types/Event';
import { Friend } from '../types/User';

interface EventInvitationCardProps {
  event: Event;
  fromFriend: Friend;
  onAccept: (eventId: string) => void;
  onDecline: (eventId: string) => void;
}

export const EventInvitationCard: React.FC<EventInvitationCardProps> = ({
  event,
  fromFriend,
  onAccept,
  onDecline,
}) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {event.image && (
        <CardMedia
          component="img"
          height="140"
          image={event.image}
          alt={event.title}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {event.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {event.description}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Дата:</strong> {new Date(event.date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2">
            <strong>Длительность:</strong> {event.duration}
          </Typography>
          <Typography variant="body2">
            <strong>Место:</strong> {event.location.address}
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Приглашение от:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img
              src={fromFriend.avatar}
              alt={fromFriend.displayName}
              style={{ width: 24, height: 24, borderRadius: '50%' }}
            />
            <Typography variant="body2">
              {fromFriend.displayName}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => onAccept(event.id)}
          >
            Принять
          </Button>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={() => onDecline(event.id)}
          >
            Отклонить
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 