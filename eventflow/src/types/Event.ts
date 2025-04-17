import { Tag } from './Tag';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  image?: string; // URL изображения места проведения
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  organizer: string;
  format: 'online' | 'offline';
  location: Location;
  tags: Tag[];
  image?: string; // URL изображения мероприятия
} 