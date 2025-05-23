import { OrganizerUser, UserRole } from '../types/User';
import { Event, Status, ModerationStatus } from '../types/Event';
import { DefaultTag } from '../types/Tag';

export const mockOrganizer: OrganizerUser = {
  id: '1',
  email: 'organizer@example.com',
  name: 'ООО "Креативные мероприятия"',
  avatar: '/test.jpg',
  role: UserRole.ORGANIZER,
  description: 'Организуем яркие и запоминающиеся мероприятия в Москве. Специализируемся на корпоративных праздниках, тимбилдингах и культурных событиях.',
  activity_area: 'Организация мероприятий, Корпоративные праздники, Тимбилдинг',
  events: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-03-15T00:00:00Z'
};

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Корпоративный тимбилдинг',
    description: 'Увлекательный тимбилдинг на природе с профессиональными тренерами. Включает командные игры, квесты и спортивные состязания.',
    date: '2024-04-15T10:00:00',
    duration: '6 часов',
    organizer: mockOrganizer.name,
    status: Status.COMINGUP,
    moderationStatus: ModerationStatus.APPROVED,
    tags: [DefaultTag.WORKSHOP, DefaultTag.OFFLINE],
    location: {
      lat: 55.7558,
      lng: 37.6173,
      address: 'Москва, Парк Горького',
      image: '/test2.jpg'
    },
    image: '/test.jpg'
  },
  {
    id: '2',
    title: 'Мастер-класс по кулинарии',
    description: 'Научитесь готовить итальянскую пасту от шеф-повара ресторана. Все ингредиенты включены в стоимость.',
    date: '2024-03-20T18:00:00',
    duration: '3 часа',
    organizer: mockOrganizer.name,
    status: Status.UNDERWAY,
    moderationStatus: ModerationStatus.APPROVED,
    tags: [DefaultTag.WORKSHOP, DefaultTag.OFFLINE],
    location: {
      lat: 55.7517,
      lng: 37.6178,
      address: 'Москва, ул. Тверская, 1',
      image: '/test3.jpg'
    },
    image: '/test2.jpg'
  },
  {
    id: '3',
    title: 'Выставка современного искусства',
    description: 'Экспозиция работ современных художников. В программе: экскурсии, лекции и мастер-классы.',
    date: '2024-02-01T11:00:00',
    duration: '8 часов',
    organizer: mockOrganizer.name,
    status: Status.HELD,
    moderationStatus: ModerationStatus.APPROVED,
    tags: [DefaultTag.EXHIBITION, DefaultTag.OFFLINE],
    location: {
      lat: 55.7494,
      lng: 37.6208,
      address: 'Москва, ул. Малая Бронная, 2',
      image: '/test.jpg'
    },
    image: '/test3.jpg'
  },
  {
    id: '4',
    title: 'Бизнес-завтрак с инвесторами',
    description: 'Нетворкинг-мероприятие для предпринимателей и инвесторов. Обсуждение трендов и поиск партнеров.',
    date: '2024-04-01T09:00:00',
    duration: '2 часа',
    organizer: mockOrganizer.name,
    status: Status.COMINGUP,
    moderationStatus: ModerationStatus.PENDING,
    tags: [DefaultTag.CONFERENCE, DefaultTag.OFFLINE],
    location: {
      lat: 55.7520,
      lng: 37.6175,
      address: 'Москва, ул. Большая Никитская, 46',
      image: '/test2.jpg'
    },
    image: '/test.jpg'
  },
  {
    id: '5',
    title: 'Концерт джазовой музыки',
    description: 'Вечер живой джазовой музыки в уютной атмосфере. Выступление известных музыкантов.',
    date: '2024-03-25T19:00:00',
    duration: '4 часа',
    organizer: mockOrganizer.name,
    status: Status.COMINGUP,
    moderationStatus: ModerationStatus.APPROVED,
    tags: [DefaultTag.FESTIVAL, DefaultTag.OFFLINE],
    location: {
      lat: 55.7539,
      lng: 37.6208,
      address: 'Москва, ул. Малая Бронная, 13',
      image: '/test3.jpg'
    },
    image: '/test2.jpg'
  }
]; 