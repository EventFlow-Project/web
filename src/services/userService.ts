import { User, SocialUser, BaseUserInfo, PrivacySetting, UpdateUser } from '../types/User';
import { authService } from './authService';
import { Event } from '../types/Event';

class UserService {
  private baseUrl = 'https://api.event-flow.ru';

  async getCurrentUser(): Promise<SocialUser> {
    try {
      const response = await fetch(`${this.baseUrl}/users/getInfo`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении данных пользователя');
      }

      const userInfo: BaseUserInfo = await response.json();
      return this.transformUserInfoToSocialUser(userInfo);
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const currentUser = await this.getCurrentUser();
      if (currentUser.id !== userId) {
        throw new Error('Доступ запрещен: вы можете просматривать только свой профиль');
      }

      const response = await fetch(`${this.baseUrl}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении данных пользователя');
      }

      const userInfo: BaseUserInfo = await response.json();
      return this.transformUserInfoToUser(userInfo);
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      throw error;
    }
  }

  private transformUserInfoToSocialUser(userInfo: BaseUserInfo): SocialUser {
    return {
      id: userInfo.email,
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.avatar,
      role: userInfo.role,
      description: userInfo.description,
      activity_area: userInfo.activity_area,
      created_at: userInfo.created_at,
      updated_at: userInfo.updated_at,
      friends: [],
      pendingFriendRequests: [],
      eventInvitations: [],
      privacySettings: {
        eventsVisibility: PrivacySetting.PUBLIC,
        friendsListVisibility: PrivacySetting.PUBLIC
      },
      events: []
    };
  }

  private transformUserInfoToUser(userInfo: BaseUserInfo): User {
    const baseUser = {
      id: userInfo.email,
      displayName: userInfo.name,
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.avatar,
      role: userInfo.role,
      description: userInfo.description,
      activity_area: userInfo.activity_area,
      created_at: userInfo.created_at,
      updated_at: userInfo.updated_at
    };

    switch (userInfo.role) {
      case 'ADMIN':
        return { ...baseUser, role: 'ADMIN' } as User;
      case 'ORGANIZER':
        return { 
          ...baseUser, 
          role: 'ORGANIZER',
          activityArea: userInfo.activity_area,
          events: []
        } as User;
      case 'PARTICIPANT':
        return { ...baseUser, role: 'PARTICIPANT' } as User;
      default:
        return { ...baseUser, role: 'PARTICIPANT' } as User;
    }
  }

  private async uploadAvatar(base64Data: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/users/uploadAvatar`, {
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

  async updateUser(userData: Partial<UpdateUser>): Promise<User> {
    try {
      const currentUser = await this.getCurrentUser();
      if (userData.email && currentUser.email !== userData.email) {
        throw new Error('Доступ запрещен: вы можете редактировать только свой профиль');
      }

      let avatarUrl = userData.avatar;
      
      if (userData.avatar && typeof userData.avatar === 'string') {
        try {
          if (userData.avatar.startsWith('data:image')) {
            // Убираем префикс data:image/...
            const base64Data = userData.avatar.split(',')[1];
            avatarUrl = await this.uploadAvatar(base64Data);
          }
        } catch (error) {
          console.error('Ошибка при загрузке аватара:', error);
          throw new Error('Ошибка при загрузке аватара. Пожалуйста, попробуйте еще раз.');
        }
      }

      const requestData = {
        email: userData.email || currentUser.email,
        name: userData.name || currentUser.name,
        avatar: avatarUrl || currentUser.avatar
      };


      const response = await fetch(`${this.baseUrl}/users/editInfo`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response error:', errorData);
        const errorMessage = errorData?.message || 'Ошибка при обновлении данных пользователя';
        throw new Error(errorMessage);
      }

      const userInfo: BaseUserInfo = await response.json();
      return this.transformUserInfoToUser(userInfo);
    } catch (error) {
      console.error('Ошибка при обновлении данных пользователя:', error);
      throw error;
    }
  }

  // пОТОМ
  async updatePrivacySettings(userId: string, settings: SocialUser['privacySettings']): Promise<SocialUser> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}/privacy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении настроек приватности');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при обновлении настроек приватности:', error);
      throw error;
    }
  }

  async getFriends(): Promise<SocialUser['friends']> {
    try {
      const response = await fetch(`${this.baseUrl}/users/getFriends`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении списка друзей');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении списка друзей:', error);
      throw error;
    }
  }

  async getPendingFriendRequests(): Promise<SocialUser['pendingFriendRequests']> {
    try {
      const response = await fetch(`${this.baseUrl}/me/friend-requests`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении заявок в друзья');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении заявок в друзья:', error);
      throw error;
    }
  }

  async getEventInvitations(): Promise<SocialUser['eventInvitations']> {
    try {
      const response = await fetch(`${this.baseUrl}/me/event-invitations`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении приглашений на мероприятия');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении приглашений на мероприятия:', error);
      throw error;
    }
  }

  async getFavoriteEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/me/favorites`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении избранных мероприятий');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении избранных мероприятий:', error);
      throw error;
    }
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}/events`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении мероприятий пользователя');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении мероприятий пользователя:', error);
      throw error;
    }
  }

  async toggleFavoriteEvent(eventId: string): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/me/favorites/${eventId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении избранных мероприятий');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при обновлении избранных мероприятий:', error);
      throw error;
    }
  }

  async signUpForEvent(eventId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при записи на мероприятие');
      }
    } catch (error) {
      console.error('Ошибка при записи на мероприятие:', error);
      throw error;
    }
  }

  async cancelEventRegistration(eventId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/signup`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при отмене записи на мероприятие');
      }
    } catch (error) {
      console.error('Ошибка при отмене записи на мероприятие:', error);
      throw error;
    }
  }

  async getEventRegistrationStatus(eventId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/signup/status`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении статуса записи на мероприятие');
      }

      const data = await response.json();
      return data.isRegistered;
    } catch (error) {
      console.error('Ошибка при получении статуса записи на мероприятие:', error);
      throw error;
    }
  }
}

export const userService = new UserService();