export type TalkType = 'conference' | 'keynote' | 'meetup' | 'podcast' | 'webinar' | 'workshop';

export const TYPE_CONFIG: Record<TalkType, { label: string; classes: string }> = {
  conference: { label: 'Conference', classes: 'bg-jungle text-white' },
  keynote:    { label: 'Keynote',    classes: 'bg-persimmon text-white' },
  meetup:     { label: 'Meetup',     classes: 'bg-pine text-mint' },
  podcast:    { label: 'Podcast',    classes: 'bg-midnight text-mint' },
  webinar:    { label: 'Webinar',    classes: 'bg-waterhole text-white' },
  workshop:   { label: 'Workshop',   classes: 'bg-fog text-pine' },
};
