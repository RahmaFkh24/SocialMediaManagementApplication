import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { dateFnsLocalizer } from 'react-big-calendar';

const locales = {
  'en-US': enUS,
};

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }), // Sunday as start of week
  getDay,
  locales,
});

export const calendarMessages = {
  allDay: 'All Day',
  previous: '<',
  next: '>',
  today: 'Today',
  month: 'Month',
  week: 'Week',
  day: 'Day',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Time',
  event: 'Event',
  noEventsInRange: 'There are no posts in this range.',
  showMore: total => `+${total} more`,
};

export const calendarFormats = {
  monthHeaderFormat: 'MMMM yyyy',
  weekdayFormat: (date, culture, localizerFn) => localizerFn.format(date, 'EEE', culture), // Sun, Mon, Tue
  dayFormat: (date, culture, localizerFn) => localizerFn.format(date, 'd', culture), // 1, 2, 3
  timeGutterFormat: (date, culture, localizerFn) => localizerFn.format(date, 'p', culture), // 8:00 AM
  selectRangeFormat: ({ start, end }, culture, localizerFn) =>
    localizerFn.format(start, 'p', culture) + ' – ' + localizerFn.format(end, 'p', culture),
  dayRangeHeaderFormat: ({ start, end }, culture, localizerFn) =>
    localizerFn.format(start, 'MMM dd', culture) + ' – ' + localizerFn.format(end, 'MMM dd', culture)
};