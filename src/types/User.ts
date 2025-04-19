import { Event } from './Event';

export enum UserRole {
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  PARTICIPANT = 'PARTICIPANT',
  MODERATOR = 'MODERATOR'
}

export enum PrivacySetting {
  PUBLIC = 'PUBLIC',
  FRIENDS_ONLY = 'FRIENDS_ONLY',
  PRIVATE = 'PRIVATE'
}

export interface UpdateUser {
  email: string;
  name: string;
  avatar: string;
}

export interface BaseUserInfo {
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
  description: string;
  activity_area: string;
  created_at: string;
  updated_at: string;
}

export interface BaseUser extends BaseUserInfo {
  id: string;
}

export interface AdminUser extends BaseUser {
  role: UserRole.ADMIN;
}

export interface ParticipantUser extends BaseUser {
  role: UserRole.PARTICIPANT;
}

export interface OrganizerUser extends BaseUser {
  role: UserRole.ORGANIZER;
  description: string;
  activityArea: string;
  events: string[]; // массив ID мероприятий
}

export interface Friend {
  id: string;
  displayName: string;
  avatar: string;
  mutualEvents: string[]; // массив ID общих мероприятий
}

export interface EventInvitation {
  event: Event;
  fromFriend: Friend;
}

export interface UserPrivacySettings {
  eventsVisibility: PrivacySetting;
  friendsListVisibility: PrivacySetting;
}

export interface SocialUser extends BaseUser {
  friends: Friend[];
  pendingFriendRequests: Friend[];
  eventInvitations: EventInvitation[];
  privacySettings: UserPrivacySettings;
  events: string[]; // массив ID мероприятий пользователя
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