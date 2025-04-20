import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { EventInvitation } from '../types/User';

interface EventInvitationCardProps {
  invitation: EventInvitation;
  onAccept: (eventId: string) => void;
  onDecline: (eventId: string) => void;
}

export const EventInvitationCard: React.FC<EventInvitationCardProps> = ({ 
  invitation, 
  onAccept, 
  onDecline 
}) => {
  return (
    <Card sx={{ maxWidth: 300, m: 1 }}>
      <CardMedia
        component="img"
        height="200"
        image={invitation.event.image || 'https://i.pravatar.cc/300'}
        alt={invitation.event.title}
      />
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {invitation.event.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          От: {invitation.fromFriend.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => onAccept(invitation.event.id)}
          >
            Принять
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            onClick={() => onDecline(invitation.event.id)}
          >
            Отклонить
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 