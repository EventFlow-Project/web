import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Box, Typography } from '@mui/material';
import EventList from '../components/EventList';
import SearchAndFilter from '../components/SearchAndFilter';
import { Event, Status, ModerationStatus } from '../types/Event';
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

// Добавляем кастомную иконку для текущего местоположения
const createLocationIcon = () => {
  const iconHtml = `
    <div style="
      background-color: #2196f3;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #2196f3;
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-location-icon',
    html: iconHtml,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const CurrentLocationIcon = createLocationIcon();

// Компонент для обновления карты при изменении местоположения
const LocationMarker: React.FC<{ position: [number, number] | null }> = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [position, map]);

  return position ? (
    <Marker position={position} icon={CurrentLocationIcon}>
      <Popup>
        <Typography variant="body2">Вы здесь</Typography>
      </Popup>
    </Marker>
  ) : null;
};

const img1 = `${process.env.PUBLIC_URL}test.jpg`;
const img2 = `${process.env.PUBLIC_URL}test2.jpg`;
const img3 = `${process.env.PUBLIC_URL}test3.jpg`;
const img4 = `${process.env.PUBLIC_URL}test4.jpg`;
const img5 = `${process.env.PUBLIC_URL}test5.jpg`;

// Добавляем стили для анимации пульсации
const pulseAnimation = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.5);
      opacity: 0.5;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .custom-location-icon::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background-color: #2196f3;
    border-radius: 50%;
    animation: pulse 2s infinite;
    z-index: -1;
  }
`;

const HomePage: React.FC = () => {
  const [allEvents] = useState<Event[]>([
    {
      id: '1',
      title: "Крутое пати",
      description: "Готовьтесь к взрывной вечеринке! Вас ждет ночь полная энергии: зажигательная музыка, яркие световые шоу",
      date: "2025-01-05T18:49",
      duration: "20:00 – 02:00",
      organizer: "Аккакий Аккакиевич",
      status: Status.COMINGUP,
      moderationStatus: ModerationStatus.APPROVED,
      image: img1,
      location: {
        lat: 55.755244,
        lng: 37.618823,
        address: "«Звездный», Кемский переулок, Санкт-Петербург",
        image: img1
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
      title: "Технологический форум 2025",
      description: "Крупнейший форум о технологиях будущего. Выступления ведущих экспертов, мастер-классы по AI и VR, нетворкинг с инноваторами. Узнайте о последних трендах в технологиях!",
      date: "2025-02-15T10:00",
      duration: "10:00 – 18:00",
      organizer: "Tech Innovations",
      status: Status.COMINGUP,
      moderationStatus: ModerationStatus.APPROVED,
      image: img2,
      location: {
        lat: 55.751244,
        lng: 37.617823,
        address: "Конгресс-центр «Технопарк», Ленинградский проспект, 80к17, Москва",
        image: img2
      },
      tags: [
        DefaultTag.CONFERENCE,
        DefaultTag.WORKSHOP,
        DefaultTag.ONLINE,
        {
          id: 'custom2',
          name: 'Технологии',
          isCustom: true
        } as CustomTag,
        {
          id: 'custom3',
          name: 'AI',
          isCustom: true
        } as CustomTag
      ],
    },
    {
      id: '3',
      title: "Ретро-волна 80-х",
      description: "Зажгите на вечеринке 80-х! Танцы под хиты Синди Лаупер и Майкла Джексона, неон, ретро-фотозона, коктейли. Наденьте яркие лосины и вернитесь в эпоху диско!",
      date: "2025-03-24T20:00",
      duration: "20:00 – 04:00",
      organizer: "RetroVibes Events",
      status: Status.COMINGUP,
      moderationStatus: ModerationStatus.APPROVED,
      image: img3,
      location: {
        lat: 59.986079,
        lng: 30.285837,
        address: "Клуб «Винил», ул. Савушкина, 21, Санкт-Петербург",
        image: img3
      },
      tags: [
        DefaultTag.FESTIVAL,
        DefaultTag.OFFLINE,
        {
          id: 'custom4',
          name: 'РетроВолна',
          isCustom: true
        } as CustomTag,
        {
          id: 'custom5',
          name: 'Музыка80х',
          isCustom: true
        } as CustomTag
      ],
    },
    {
      id: '4',
      title: "Фестиваль уличной еды",
      description: "Гастрономический праздник под открытым небом! Более 50 фудтраков с блюдами со всего мира, кулинарные мастер-классы, живая музыка и конкурсы. Вход свободный!",
      date: "2025-04-10T12:00",
      duration: "12:00 – 22:00",
      organizer: "FoodFest Pro",
      status: Status.COMINGUP,
      moderationStatus: ModerationStatus.APPROVED,
      image: img4,
      location: {
        lat: 55.761244,
        lng: 37.627823,
        address: "Парк Горького, Крымский Вал, 9, Москва",
        image: img4
      },
      tags: [
        DefaultTag.FESTIVAL,
        DefaultTag.OFFLINE,
        {
          id: 'custom6',
          name: 'Фудфест',
          isCustom: true
        } as CustomTag,
        {
          id: 'custom7',
          name: 'УличнаяЕда',
          isCustom: true
        } as CustomTag
      ],
    },
    {
      id: '5',
      title: "Хакатон по разработке игр",
      description: "48 часов интенсивной разработки игр! Создайте свою игру с нуля, работайте в команде, получайте менторскую поддержку от профессионалов индустрии. Призовой фонд 500,000₽!",
      date: "2025-05-01T09:00",
      duration: "48 часов",
      organizer: "GameDev Hub",
      status: Status.COMINGUP,
      moderationStatus: ModerationStatus.APPROVED,
      image: img5,
      location: {
        lat: 55.771244,
        lng: 37.637823,
        address: "Коворкинг «Код», ул. Тверская, 1, Москва",
        image: img5
      },
      tags: [
        DefaultTag.HACKATHON,
        DefaultTag.WORKSHOP,
        DefaultTag.OFFLINE,
        {
          id: 'custom8',
          name: 'GameDev',
          isCustom: true
        } as CustomTag,
        {
          id: 'custom9',
          name: 'Хакатон',
          isCustom: true
        } as CustomTag
      ],
    }
  ]);

  const [filteredEvents, setFilteredEvents] = useState<Event[]>(allEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Получение текущего местоположения
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setLocationError(null);
        },
        (error) => {
          console.error("Ошибка получения местоположения:", error);
          setLocationError("Не удалось получить ваше местоположение");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("Геолокация не поддерживается вашим браузером");
    }
  }, []);

  useEffect(() => {
    // Добавляем стили для анимации
    const style = document.createElement('style');
    style.textContent = pulseAnimation;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
        {locationError && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 16px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <Typography variant="body2" color="error">
              {locationError}
            </Typography>
          </Box>
        )}
        <MapContainer
          center={currentLocation || [55.751244, 37.618423]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <TileLayer
            url="https://core-renderer-tiles.maps.yandex.net/tiles?l=map&v=23.03.14-0-b230320170451&x={x}&y={y}&z={z}&scale=1&lang=ru_RU"
            attribution='&copy; <a href="https://yandex.ru/maps/">Яндекс.Карты</a>'
          />
          <LocationMarker position={currentLocation} />
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