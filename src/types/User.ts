export enum UserRole {
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  PARTICIPANT = 'PARTICIPANT'
}

export interface BaseUser {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
}

export interface AdminUser extends BaseUser {
  role: UserRole.ADMIN;
}

export interface ParticipantUser extends BaseUser {
  role: UserRole.PARTICIPANT;
  interests?: string[];
}

export interface OrganizerUser extends BaseUser {
  role: UserRole.ORGANIZER;
  organizationName: string;
  description: string;
  activityArea: string;
  events: string[]; // массив ID мероприятий
}

export type User = AdminUser | OrganizerUser | ParticipantUser;

// Type guard для определения типа пользователя
export const isOrganizer = (user: User): user is OrganizerUser => {
  return user.role === UserRole.ORGANIZER;
};

export const isAdmin = (user: User): user is AdminUser => {
  return user.role === UserRole.ADMIN;
};

export const isParticipant = (user: User): user is ParticipantUser => {
  return user.role === UserRole.PARTICIPANT;
}; 