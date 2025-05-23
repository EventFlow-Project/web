import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { EventStats, UserEventStats, UserEventActivity } from '../types/Event';
import { mockEventStats, mockUserEventStats } from '../mocks/eventStats';

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
      id={`stats-tabpanel-${index}`}
      aria-labelledby={`stats-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EventStatsComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEventStats = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Название мероприятия</TableCell>
            <TableCell align="right">Просмотры</TableCell>
            <TableCell align="right">Уникальные посетители</TableCell>
            <TableCell align="right">Регистрации</TableCell>
            <TableCell align="right">В избранном</TableCell>
            <TableCell align="right">Конверсия регистраций</TableCell>
            <TableCell align="right">Конверсия избранного</TableCell>
            <TableCell align="right">Дата создания</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockEventStats.map((event) => (
            <TableRow key={event.eventId}>
              <TableCell component="th" scope="row">
                {event.title}
              </TableCell>
              <TableCell align="right">{event.viewsCount}</TableCell>
              <TableCell align="right">{event.uniqueVisitorsCount}</TableCell>
              <TableCell align="right">{event.registrationsCount}</TableCell>
              <TableCell align="right">{event.favoritesCount}</TableCell>
              <TableCell align="right">{event.registrationRate.toFixed(1)}%</TableCell>
              <TableCell align="right">{event.favoriteRate.toFixed(1)}%</TableCell>
              <TableCell align="right">{formatDate(event.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderUserStats = () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      {mockUserEventStats.map((user) => (
        <Card key={user.userId}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {user.userName}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {user.userEmail}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Всего просмотрено мероприятий: {user.totalEventsViewed}
              </Typography>
              <Typography variant="body2">
                Зарегистрировался на мероприятий: {user.totalEventsRegistered}
              </Typography>
              <Typography variant="body2">
                Добавил в избранное: {user.totalEventsFavorited}
              </Typography>
              <Typography variant="body2">
                Средняя конверсия регистраций: {user.averageRegistrationRate}%
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                История активности:
              </Typography>
              {user.events.map((event: UserEventActivity) => (
                <Box key={event.eventId} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {event.eventTitle}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Просмотрено: {formatDate(event.viewedAt)}
                    {event.registeredAt && ` • Зарегистрирован: ${formatDate(event.registeredAt)}`}
                    {event.favoritedAt && ` • В избранном: ${formatDate(event.favoritedAt)}`}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Статистика мероприятий" />
          <Tab label="Активность пользователей" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {renderEventStats()}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {renderUserStats()}
      </TabPanel>
    </Box>
  );
};

export default EventStatsComponent; 