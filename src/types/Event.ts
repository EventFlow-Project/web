import { Tag } from './Tag';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  image?: string; // URL изображения места проведения
}

export enum Status {
  COMINGUP = 'Предстоит',
  UNDERWAY = 'Идёт',
  HELD = 'Прошло',
}

export enum ModerationStatus {
  PENDING = 'На модерации',
  APPROVED = 'Одобрено',
  REJECTED = 'Отклонено'
}

export interface NotableParticipant {
  id: string;
  name: string;
  role: 'SPEAKER' | 'ORGANIZER' | 'GUEST';
  avatar?: string;
  description?: string;
  isVerified?: boolean; // Для подтвержденных известных личностей
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  organizer: string;
  status: Status;
  moderationStatus: ModerationStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
    image?: string;
  };
  tags: Tag[];
  image?: string;
  notableParticipants?: NotableParticipant[]; // Добавляем поле для известных участников
  isNotableEvent?: boolean; // Флаг для маркировки мероприятий с известными участниками
}

export interface EventStats {
  eventId: string;
  title: string;
  favoritesCount: number;
  registrationsCount: number;
  viewsCount: number;
  uniqueVisitorsCount: number;
  registrationRate: number;
  favoriteRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserEventActivity {
  eventId: string;
  eventTitle: string;
  isFavorite: boolean;
  isRegistered: boolean;
  viewedAt: string;
  registeredAt?: string;
  favoritedAt?: string;
}

export interface UserEventStats {
  userId: string;
  userName: string;
  userEmail: string;
  events: UserEventActivity[];
  totalEventsViewed: number;
  totalEventsRegistered: number;
  totalEventsFavorited: number;
  averageRegistrationRate: number;
} 