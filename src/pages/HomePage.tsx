import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Box, Typography } from '@mui/material';
import EventList from '../components/EventList';
import SearchAndFilter from '../components/SearchAndFilter';
import { Event, Status } from '../types/Event';
import { DefaultTag, CustomTag } from '../types/Tag';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';

// Fix for default marker icon
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

const img = `${process.env.PUBLIC_URL}test.jpg`;

const HomePage: React.FC = () => {
  const [allEvents] = useState<Event[]>([
    {
      id: '1',
      title: "1",
      description: "Жесткое пати где всем рады, влетайте и не залетайте\n(весь набор первой помощи имеется)",
      date: "2025-01-05T18:49",
      duration: "1 час",
      organizer: "Хурма1",
      status: Status.COMINGUP,
      image: img,
      location: {
        lat: 55.755244,
        lng: 37.618823,
        address: "Подвал Джейсона Вурхиза",
        image: img
      },
      tags: [
        DefaultTag.CONFERENCE,
        DefaultTag.WORKSHOP,
        DefaultTag.EXHIBITION,
        DefaultTag.FESTIVAL,
        DefaultTag.HACKATHON,
        DefaultTag.MEETUP,
        DefaultTag.ONLINE,
        DefaultTag.OFFLINE,
        {
          id: 'custom1',
          name: 'Мой тег',
          isCustom: true
        } as CustomTag
      ],
    },
    {
      id: '2',
      title: "2",
      description: "Жесткое пати где всем рады, влетайте и не залетайте\n(весь набор первой помощи имеется)",
      date: "2025-02-05T18:49",
      duration: "1 час",
      organizer: "Хурма2",
      status: Status.COMINGUP,
      image: img,
      location: {
        lat: 55.751394,
        lng: 37.618493,
        address: "Подвал Джейсона Вурхиза",
        image: img
      },
      tags: [
        DefaultTag.CONFERENCE,
        {
          id: 'custom1',
          name: 'писюн',
          isCustom: true
        } as CustomTag
      ],
    }
  ]);

  const [filteredEvents, setFilteredEvents] = useState<Event[]>(allEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([]);

  const handleFilterChange = (filtered: Event[]) => {
    const uniqueEvents = filtered.filter((event, index, self) =>
      index === self.findIndex((e) => e.id === event.id)
    );
    setFilteredEvents(uniqueEvents);
    setSelectedEvent(null);
  };

  const handleMarkerClick = (event: Event) => {
    setSelectedEvent(event);
    setFilteredEvents([event]);
  };

  const handleResetSelection = () => {
    setSelectedEvent(null);
    setFilteredEvents(allEvents);
  };

  const handleToggleFavorite = (eventId: string) => {
    setFavoriteEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const createClusterCustomIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    let color = '#3498db'; // синий для 1 мероприятия
    
    if (count >= 10) {
      color = '#e74c3c'; // красный для 10+ мероприятий
    } else if (count >= 5) {
      color = '#f39c12'; // оранжевый для 5-9 мероприятий
    } else if (count >= 2) {
      color = '#2ecc71'; // зеленый для 2-4 мероприятий
    }

    return L.divIcon({
      html: `<div style="background-color:${color}; width: 40px; height: 40px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.5);">
        <span>${count}</span>
      </div>`,
      className: 'marker-cluster-custom',
      iconSize: L.point(40, 40, true)
    });
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box
        id='top-map'
        sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '60vh',
          zIndex: 1
        }}
      >
        <MapContainer
          center={[55.751244, 37.618423]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://core-renderer-tiles.maps.yandex.net/tiles?l=map&v=23.03.14-0-b230320170451&x={x}&y={y}&z={z}&scale=1&lang=ru_RU"
            attribution='&copy; <a href="https://yandex.ru/maps/">Яндекс.Карты</a>'
          />
          <MarkerClusterGroup
            showCoverageOnHover={false}
            iconCreateFunction={createClusterCustomIcon}
          >
            {allEvents.map((event) => (
              <Marker
                key={event.id}
                position={[event.location.lat, event.location.lng]}
                eventHandlers={{
                  click: () => handleMarkerClick(event),
                }}
              >
                <Popup>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography variant="body2">{event.description}</Typography>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </Box>

      <Box
        id='events-section'
        sx={{ 
          mt: '60vh', 
          position: 'relative', 
          zIndex: 2, 
          width: '100%',
          boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
          padding: '20px',
          minHeight: '90vh'
        }}
      >
        <Box sx={{ maxWidth: '1400px', margin: '0 auto', pt: 5 }}>
          <Box sx={{ display: 'flex', gap: 2, height: '56px', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <SearchAndFilter 
                events={allEvents} 
                onFilterChange={handleFilterChange}
                selectedEvent={selectedEvent}
                onResetSelection={handleResetSelection}
              />
            </Box>
          </Box>
          <EventList 
            events={filteredEvents} 
            itemCountColumn={3} 
            favoriteEvents={favoriteEvents}
            onToggleFavorite={handleToggleFavorite}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage; 