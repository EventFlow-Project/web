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
} 