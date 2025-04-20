import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Friend, EventInvitation, SocialUser } from '../types/User';
import { Event } from '../types/Event';
import { FriendCard } from './FriendCard';
import { FriendRequestCard } from './FriendRequestCard';
import EventList from './EventList';
import { AddFriendDialog } from './AddFriendDialog';
import { EventInvitationCard } from './EventInvitationCard';
import { userService } from '../services/userService';

interface FriendsListProps {
  eventInvitations: SocialUser['eventInvitations'];
  onAddFriend: (friendId: string) => void;
  onAcceptRequest: (userId: string) => void;
  onRejectRequest: (userId: string) => void;
  onRemoveFriend: (friendId: string) => void;
  onAcceptInvitation: (eventId: string) => void;
  onDeclineInvitation: (eventId: string) => void;
  favoriteEvents: string[];
  onToggleFavorite: (eventId: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`friends-tabpanel-${index}`}
      aria-labelledby={`friends-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const FriendsList: React.FC<FriendsListProps> = ({
  eventInvitations,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onAcceptInvitation,
  onDeclineInvitation,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsData = await userService.getFriends(); // Already guaranteed to be Friend[]
        setFriends(friendsData);
        console.log('Friends (state):', friendsData);
      } catch (error) {
        console.error('Error loading friends:', error);
        setFriends([]); // Set empty array on error
      }
    };
    const loadPendingRequests = async () => {
      try {
        const pendingRequestsData = await userService.getPendingFriendRequests(); // Already guaranteed to be Friend[]
        setPendingRequests(pendingRequestsData);
        console.log('Pending Requests (state):', pendingRequestsData);
      } catch (error) {
        console.error('Error loading pending requests:', error);
        setPendingRequests([]); // Set empty array on error
      }
    };
    loadFriends();
    loadPendingRequests();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log('Tab changed to:', newValue);
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Друзья" />
          <Tab label="Заявки" />
          <Tab label="Приглашения" />
        </Tabs>
      </Box>

      <Paper sx={{ p: 2 }}>
        {activeTab === 0 && (
          <Box>
            {friends.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                У вас пока нет друзей
              </Typography>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                {friends.map((friend) => (
                  <Box key={friend.id}>
                    <FriendCard
                      friend={friend}
                      onRemove={onRemoveFriend}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {pendingRequests.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                У вас нет новых заявок
              </Typography>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                {pendingRequests.map((request) => (
                  <Box key={request.id}>
                    <FriendRequestCard
                      friend={request}
                      onAccept={onAcceptRequest}
                      onReject={onRejectRequest}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* {activeTab === 2 && (
          <Box>
            {Array.isArray(eventInvitations) && eventInvitations.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                {eventInvitations.map((invitation) => (
                  <Box key={invitation.event.id}>
                    <EventInvitationCard
                      invitation={invitation}
                      onAccept={onAcceptInvitation}
                      onDecline={onDeclineInvitation}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center">
                У вас нет новых приглашений
              </Typography>
            )}
          </Box>
        )} */}
      </Paper>
    </Box>
  );
}; 