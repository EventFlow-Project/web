import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Friend, EventInvitation } from '../types/User';
import { Event } from '../types/Event';
import { FriendCard } from './FriendCard';
import { FriendRequestCard } from './FriendRequestCard';
import EventList from './EventList';

interface FriendsListProps {
  friends: Friend[];
  pendingRequests: Friend[];
  eventInvitations: EventInvitation[];
  onAddFriend: () => void;
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
  friends,
  pendingRequests,
  eventInvitations,
  onAddFriend,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onAcceptInvitation,
  onDeclineInvitation,
  favoriteEvents,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEventClick = (clickedEvent: Event) => {
    if (window.confirm('Принять приглашение на мероприятие?')) {
      onAcceptInvitation(clickedEvent.id);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Друзья</Typography>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          onClick={onAddFriend}
        >
          Добавить друга
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label={`Друзья (${friends.length})`}
            id="friends-tab-0"
            aria-controls="friends-tabpanel-0"
          />
          <Tab 
            label={`Заявки (${pendingRequests.length})`}
            id="friends-tab-1"
            aria-controls="friends-tabpanel-1"
          />
          <Tab 
            label={`Приглашения (${eventInvitations.length})`}
            id="friends-tab-2"
            aria-controls="friends-tabpanel-2"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {friends.map((friend) => (
              <Box key={friend.id}>
                <FriendCard
                  friend={friend}
                  onRemove={onRemoveFriend}
                />
              </Box>
            ))}
            {friends.length === 0 && (
              <Box>
                <Typography color="text.secondary" align="center">
                  У вас пока нет друзей
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {pendingRequests.map((request) => (
              <Box key={request.id}>
                <FriendRequestCard
                  request={request}
                  onAccept={onAcceptRequest}
                  onReject={onRejectRequest}
                />
              </Box>
            ))}
            {pendingRequests.length === 0 && (
              <Box>
                <Typography color="text.secondary" align="center">
                  У вас нет новых заявок в друзья
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {eventInvitations.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <EventList 
                events={eventInvitations.map(inv => ({
                  ...inv.event,
                  title: `Приглашение от ${inv.fromFriend.displayName}: ${inv.event.title}`
                }))}
                itemCountColumn={3}
                isInvitation={true}
                onAcceptInvitation={onAcceptInvitation}
                onDeclineInvitation={onDeclineInvitation}
                favoriteEvents={favoriteEvents || []}
                onToggleFavorite={onToggleFavorite}
              />
            </Box>
          ) : (
            <Typography color="text.secondary" align="center">
              У вас нет новых приглашений на мероприятия
            </Typography>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
}; 