import { User, SocialUser, BaseUserInfo, PrivacySetting, UpdateUser, Friend } from '../types/User';
import { authService } from './authService';
import { Event } from '../types/Event';

class UserService {
  private baseUrl = 'http://127.0.0.1:8080';

  async getCurrentUser(): Promise<SocialUser> {
    try {
      const response = await fetch(`${this.baseUrl}/users/getInfo`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in getCurrentUser:', errorData);
        throw new Error('Ошибка при получении данных пользователя');
      }

      const userInfo: BaseUserInfo = await response.json();
      return this.transformUserInfoToSocialUser(userInfo);
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const currentUser = await this.getCurrentUser();
      if (currentUser.id !== userId) {
        console.error('Access denied in getUserById: User can only view their own profile');
        throw new Error('Доступ запрещен: вы можете просматривать только свой профиль');
      }

      const response = await fetch(`${this.baseUrl}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in getUserById:', errorData);
        throw new Error('Ошибка при получении данных пользователя');
      }

      const userInfo: BaseUserInfo = await response.json();
      return this.transformUserInfoToUser(userInfo);
    } catch (error) {
      console.error('Error in getUserById:', error);
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
      case 'MODERATOR':
        return { ...baseUser, role: 'MODERATOR' } as User;
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
        console.error('Access denied in updateUser: User can only edit their own profile');
        throw new Error('Доступ запрещен: вы можете редактировать только свой профиль');
      }

      let avatarUrl = userData.avatar;
      
      if (userData.avatar && typeof userData.avatar === 'string') {
        try {
          if (userData.avatar.startsWith('data:image')) {
            const base64Data = userData.avatar.split(',')[1];
            avatarUrl = await this.uploadAvatar(base64Data);
          }
        } catch (error) {
          console.error('Error uploading avatar in updateUser:', error);
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
        console.error('Error in updateUser:', errorData);
        throw new Error(errorData?.message || 'Ошибка при обновлении данных пользователя');
      }

      const userInfo: BaseUserInfo = await response.json();
      return this.transformUserInfoToUser(userInfo);
    } catch (error) {
      console.error('Error in updateUser:', error);
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
        const errorData = await response.json().catch(() => null);
        console.error('Error in updatePrivacySettings:', errorData);
        throw new Error('Ошибка при обновлении настроек приватности');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in updatePrivacySettings:', error);
      throw error;
    }
  }
  // Принятые друзья
  async getFriends(): Promise<SocialUser['friends']> {
    try {
      const response = await fetch(`${this.baseUrl}/users/friends`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in getFriends:', errorData);
        throw new Error('Ошибка при получении списка друзей');
      }

      const data = await response.json();
      // Ensure we return the array, even if API wraps it in an object
      return Array.isArray(data) ? data : (data && Array.isArray(data.friends) ? data.friends : []);
    } catch (error) {
      console.error('Error in getFriends:', error);
      throw error;
    }
  }

  // Запросы в друзья 
  async getPendingFriendRequests(): Promise<SocialUser['pendingFriendRequests']> {
    try {
      console.log('Запрос заявок в друзья...');
      const response = await fetch(`${this.baseUrl}/users/friends/incoming`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in getPendingFriendRequests:', errorData);
        throw new Error('Ошибка при получении заявок в друзья');
      }

      const data = await response.json();
      console.log('Получены заявки в друзья (сырые):', data);
      // Ensure we return the array, handling potential wrapping objects
      const requestsArray = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.requests) 
             ? data.requests 
             : (data && Array.isArray(data.pendingFriendRequests) 
                ? data.pendingFriendRequests 
                : []));
      console.log('Возвращаются заявки в друзья (массив):', requestsArray);
      return requestsArray; 
    } catch (error) {
      console.error('Error in getPendingFriendRequests:', error);
      throw error;
    }
  }


  async addFriend(friendId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/friends/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to_id: friendId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in addFriend:', errorData);
        throw new Error('Ошибка при отправке запроса в друзья');
      }
    } catch (error) {
      console.error('Error in addFriend:', error);
      throw error;
    }
  }

  async removeFriend(friendId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in removeFriend:', errorData);
        throw new Error('Ошибка при удалении друга');
      }
    } catch (error) {
      console.error('Error in removeFriend:', error);
      throw error;
    }
  }

  async acceptFriendRequest(friendId: string, accept: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/friends/respond`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friend_id: friendId,
          accept: accept
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in acceptFriendRequest:', errorData);
        throw new Error('Ошибка при принятии запроса в друзья');
      }
    } catch (error) {
      console.error('Error in acceptFriendRequest:', error);
      throw error;
    }
  }
  async searchUsers(name: string): Promise<Friend[]> {
    try {
      const response = await fetch(
        `https://api.event-flow.ru/users/search?name=${name}`,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in searchUsers:', errorData);
        throw new Error('Ошибка при поиске пользователей');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw error;
    }
  }

    // Приглашения на мероприятия
    async getEventInvitations(): Promise<SocialUser['eventInvitations']> {
      try {
        const response = await fetch(`${this.baseUrl}/me/event-invitations`, {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Error in getEventInvitations:', errorData);
          throw new Error('Ошибка при получении приглашений на мероприятия');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error in getEventInvitations:', error);
        throw error;
      }
    }

  // Избранные мероприятия
  async getFavoriteEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/me/favorites`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in getFavoriteEvents:', errorData);
        throw new Error(errorData?.message || 'Ошибка при получении избранных мероприятий');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getFavoriteEvents:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Ошибка при получении избранных мероприятий: нет соединения с сервером');
        }
        throw error;
      }
      throw new Error('Ошибка при получении избранных мероприятий');
    }
  }

  async getUserEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/events`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in getUserEvents:', errorData);
        throw new Error('Ошибка при получении мероприятий пользователя');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getUserEvents:', error);
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
        const errorData = await response.json().catch(() => null);
        console.error('Error in toggleFavoriteEvent:', errorData);
        throw new Error('Ошибка при обновлении избранных мероприятий');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in toggleFavoriteEvent:', error);
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
        const errorData = await response.json().catch(() => null);
        console.error('Error in signUpForEvent:', errorData);
        throw new Error('Ошибка при записи на мероприятие');
      }
    } catch (error) {
      console.error('Error in signUpForEvent:', error);
      throw error;
    }
  }

  async cancelEventRegistration(eventId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in cancelEventRegistration:', errorData);
        throw new Error('Ошибка при отмене регистрации на мероприятие');
      }
    } catch (error) {
      console.error('Error in cancelEventRegistration:', error);
      throw error;
    }
  }

  async checkEventRegistration(eventId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/check-registration`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error in checkEventRegistration:', errorData);
        throw new Error('Ошибка при проверке статуса регистрации');
      }

      const data = await response.json();
      return data.isRegistered || false;
    } catch (error) {
      console.error('Error in checkEventRegistration:', error);
      return false;
    }
  }
}

export const userService = new UserService();