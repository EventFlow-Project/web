export enum DefaultTag {
  CONFERENCE = 'Конференция',
  WORKSHOP = 'Воркшоп',
  MEETUP = 'Митап',
  HACKATHON = 'Хакатон',
  EXHIBITION = 'Выставка',
  FESTIVAL = 'Фестиваль',
  ONLINE = 'Онлайн',
  OFFLINE = 'Оффлайн',
}

export const defaultTagColors: Record<DefaultTag, string> = {
  [DefaultTag.CONFERENCE]: '#FF5733',
  [DefaultTag.WORKSHOP]: '#33FF57',
  [DefaultTag.MEETUP]: '#3357FF',
  [DefaultTag.HACKATHON]: '#F033FF',
  [DefaultTag.EXHIBITION]: '#FF33F0',
  [DefaultTag.FESTIVAL]: '#33FFF0',
  [DefaultTag.ONLINE]: '#A4DF45',
  [DefaultTag.OFFLINE]: '#4133FF',
};


export const DEFAULT_CUSTOM_TAG_COLOR = '#808080';

export type CustomTag = {
  id: string;
  name: string;
  isCustom: true;
  color?: string;
};

export type Tag = DefaultTag | CustomTag; 