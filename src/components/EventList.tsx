import React from 'react';
import { Event } from '../types/Event';
import {EventCard} from './EventCard';

interface EventListProps {
  events: Event[];
  itemCountColumn: number;
}

const EventList: React.FC<EventListProps> = ({ events, itemCountColumn}) => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: `repeat(${itemCountColumn}, 1fr)`,
      gap: '48px',
      padding: '15px 0'
    }}>
      {events.map((event) => (
        <div key={event.id}>
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
};

export default EventList; 