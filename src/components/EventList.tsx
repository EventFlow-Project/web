import React from 'react';
import { Event } from '../types/Event';
import { Friend } from '../types/User';
import { EventCard } from './EventCard';

interface EventListProps {
  events: Event[];
  itemCountColumn: number;
  onEventClick?: (event: Event) => void;
  isInvitation?: boolean;
  onAcceptInvitation?: (eventId: string) => void;
  onDeclineInvitation?: (eventId: string) => void;
  favoriteEvents?: string[];
  onToggleFavorite?: (eventId: string) => void;
  friends?: Friend[];
  onInviteFriend?: (eventId: string, friendId: string) => void;
  showModerationStatus?: boolean;
}

const EventList: React.FC<EventListProps> = ({ 
  events, 
  itemCountColumn, 
  onEventClick,
  isInvitation,
  onAcceptInvitation,
  onDeclineInvitation,
  favoriteEvents = [],
  onToggleFavorite,
  friends = [],
  onInviteFriend,
  showModerationStatus = false
}) => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: `repeat(${itemCountColumn}, 1fr)`,
      gap: '24px',
      padding: '15px 0'
    }}>
      {events.map((event) => (
        <div 
          key={event.id} 
          onClick={() => onEventClick?.(event)}
          style={{ cursor: 'pointer' }}
        >
          <EventCard 
            event={event} 
            isInvitation={isInvitation}
            onAcceptInvitation={onAcceptInvitation}
            onDeclineInvitation={onDeclineInvitation}
            isFavorite={favoriteEvents.includes(event.id)}
            onToggleFavorite={onToggleFavorite}
            friends={friends}
            onInviteFriend={onInviteFriend}
            showModerationStatus={showModerationStatus}
          />
        </div>
      ))}
    </div>
  );
};

export default EventList; 