import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Friend } from '../types/User';

interface FriendCardProps {
  friend: Friend;
  onRemove: (friendId: string) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onRemove }) => {
  return (
    <Card sx={{ maxWidth: 300, m: 1 }}>
      <CardMedia
        component="img"
        height="200"
        image={friend.avatar || 'https://i.pravatar.cc/300'}
        alt={friend.displayName}
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div">
            {friend.displayName}
          </Typography>
          <IconButton 
            onClick={() => onRemove(friend.id)}
            color="error"
            size="small"
          >
            <PersonRemoveIcon />
          </IconButton>
        </Box>
        <Chip
          label={`Общих мероприятий: ${friend.mutualEvents.length}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </CardContent>
    </Card>
  );
}; 