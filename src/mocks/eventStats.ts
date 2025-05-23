import { EventStats, UserEventStats } from '../types/Event';

export const mockEventStats: EventStats[] = [
  {
    eventId: '1',
    title: 'Конференция по веб-разработке',
    favoritesCount: 45,
    registrationsCount: 120,
    viewsCount: 350,
    uniqueVisitorsCount: 280,
    registrationRate: 34.3, // 120/350 * 100
    favoriteRate: 12.9, // 45/350 * 100
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-15T15:30:00Z'
  },
  {
    eventId: '2',
    title: 'Воркшоп по React',
    favoritesCount: 78,
    registrationsCount: 95,
    viewsCount: 420,
    uniqueVisitorsCount: 380,
    registrationRate: 22.6,
    favoriteRate: 18.6,
    createdAt: '2024-03-05T14:00:00Z',
    updatedAt: '2024-03-16T12:00:00Z'
  },
  {
    eventId: '3',
    title: 'Митап по TypeScript',
    favoritesCount: 32,
    registrationsCount: 85,
    viewsCount: 280,
    uniqueVisitorsCount: 250,
    registrationRate: 30.4,
    favoriteRate: 11.4,
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-03-17T16:45:00Z'
  }
];

export const mockUserEventStats: UserEventStats[] = [
  {
    userId: '1',
    userName: 'Иван Петров',
    userEmail: 'ivan@example.com',
    events: [
      {
        eventId: '1',
        eventTitle: 'Конференция по веб-разработке',
        isFavorite: true,
        isRegistered: true,
        viewedAt: '2024-03-14T10:00:00Z',
        registeredAt: '2024-03-14T10:05:00Z',
        favoritedAt: '2024-03-14T10:10:00Z'
      },
      {
        eventId: '2',
        eventTitle: 'Воркшоп по React',
        isFavorite: false,
        isRegistered: true,
        viewedAt: '2024-03-15T14:00:00Z',
        registeredAt: '2024-03-15T14:30:00Z'
      }
    ],
    totalEventsViewed: 2,
    totalEventsRegistered: 2,
    totalEventsFavorited: 1,
    averageRegistrationRate: 100 // 2/2 * 100
  },
  {
    userId: '2',
    userName: 'Мария Сидорова',
    userEmail: 'maria@example.com',
    events: [
      {
        eventId: '1',
        eventTitle: 'Конференция по веб-разработке',
        isFavorite: true,
        isRegistered: false,
        viewedAt: '2024-03-14T11:00:00Z',
        favoritedAt: '2024-03-14T11:15:00Z'
      },
      {
        eventId: '3',
        eventTitle: 'Митап по TypeScript',
        isFavorite: true,
        isRegistered: true,
        viewedAt: '2024-03-16T09:00:00Z',
        registeredAt: '2024-03-16T09:20:00Z',
        favoritedAt: '2024-03-16T09:25:00Z'
      }
    ],
    totalEventsViewed: 2,
    totalEventsRegistered: 1,
    totalEventsFavorited: 2,
    averageRegistrationRate: 50 // 1/2 * 100
  }
]; 