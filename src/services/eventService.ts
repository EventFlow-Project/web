import { Event, ModerationStatus } from '../types/Event';
import { authService } from './authService';
import { DefaultTag, CustomTag, DefaultTagFormatted, defaultTagColors } from '../types/Tag';

const API_URL = 'http://127.0.0.1:8080';

class EventService {
  private static instance: EventService;

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  // Create a new event
  async createEvent(event: Event): Promise<Event> {
    // Преобразуем теги в нужный формат
    const transformedTags = event.tags.map(tag => {
      if (typeof tag === 'string') {
        // Если тег - это DefaultTag (строка), преобразуем его в DefaultTagFormatted
        const defaultTag = tag as DefaultTag;
        return {
          id: `default-${defaultTag}`,
          name: defaultTag,
          isCustom: false,
          color: defaultTagColors[defaultTag]
        } as DefaultTagFormatted;
      }
      // Если тег уже в формате CustomTag, оставляем как есть
      return tag;
    });

    // Создаем копию события без id
    const { id, ...eventWithoutId } = event;

    const eventToCreate = {
      ...eventWithoutId,
      tags: transformedTags
    };

    console.log(eventToCreate);
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify(eventToCreate)
    });

    if (!response.ok) {
      throw new Error('Failed to create event');
    }

    return response.json();
  }

  // Update an existing event
  async updateEvent(eventId: string, event: Partial<Event>): Promise<void> {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error('Failed to update event');
    }
  }
  async uploadEventImage(image: string): Promise<string> {
    try {
      const base64Data = image.split(',')[1];
      const response = await fetch(`${API_URL}/events/uploadImage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base64_data: base64Data
        })
      });

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('Размер файла слишком большой. Пожалуйста, выберите файл меньшего размера.');
        }
        const errorData = await response.json().catch(() => null);
        console.error('Server upload response error:', errorData);
        throw new Error(errorData?.message || 'Ошибка при загрузке файла');
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('Сервер не вернул URL загруженного файла');
      }
      return data.url;
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      throw error;
    }
  }

  // Delete an event
  async deleteEvent(eventId: string): Promise<void> {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
  }

  // Get a single event
  async getEventById(eventId: string): Promise<Event> {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get event');
    }

    return response.json();
  }
  async getEventByModerationStatus(status: ModerationStatus): Promise<Event> {
    const response = await fetch(`${API_URL}/events/moderation/${status}`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get organizer events');
    }

    return response.json();
  }

  // Get all events for the current organizer
  async getEventsByOrganizerId(organizerId: string): Promise<Event[]> {
    const response = await fetch(`${API_URL}/events/organizer/${organizerId}`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get events by organizer id');
    }

    return response.json();
  }


}

export const eventService = EventService.getInstance(); 