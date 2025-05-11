import {
  isToday,
  isYesterday,
  isPast,
  isWithinInterval,
  startOfYear,
  endOfYear,
  format,
  subDays,
  parseISO,
  isValid,
} from 'date-fns';
import { enGB, de } from 'date-fns/locale';

export const formatTimestamp = (timestampString?: string) => {
  console.log('timestamp', timestampString);

  if (!timestampString) {
    return '';
  }

  const date = parseISO(timestampString);
  const now = new Date();

  if (!isValid(date) || !isPast(date)) {
    return '';
  }

  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: enGB });
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  const sevenDaysAgo = subDays(now, 6);
  if (isWithinInterval(date, { start: sevenDaysAgo, end: now })) {
    return format(date, 'EEEE', { locale: enGB });
  }

  if (
    isWithinInterval(date, { start: startOfYear(now), end: endOfYear(now) })
  ) {
    return format(date, 'dd.MM', { locale: de });
  }

  return format(date, 'dd.MM.yyyy', { locale: de });
};
