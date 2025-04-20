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
        image={friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=random&color=fff&size=300`}
        alt={friend.name}
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div">
            {friend.name}
          </Typography>
          <IconButton 
            onClick={() => onRemove(friend.id)}
            color="error"
            size="small"
          >
            <PersonRemoveIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}; 