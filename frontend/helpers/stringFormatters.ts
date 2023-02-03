import fallBackProfilePictureURL from '../assets/images/fallback-pp.webp';
import {
  isToday,
  isWithinLast7Days,
  isWithinYear,
  isYesterday,
} from './dateUtils';

export const formatPicURL = (profilePictureUrl?: string) => {
  if (!profilePictureUrl) {
    return fallBackProfilePictureURL.src;
  }

  const defaultPpRegEx = /^default_[0-9]$/i;
  if (profilePictureUrl.match(defaultPpRegEx)) {
    const num = profilePictureUrl.replace('default_', '');
    return 'https://cdn.emyht.com/default_profile_pictures/' + num + '.svg';
  }

  const defaultGroupPicRegEx = /^default_group_[0-9]$/i;
  if (profilePictureUrl.match(defaultGroupPicRegEx)) {
    const num = profilePictureUrl.replace('default_group_', '');
    return 'https://cdn.emyht.com/default_group_pictures/' + num + '.svg';
  }
  return profilePictureUrl;
};

export const formatTimestamp = (timestamp: number) => {
  const millisecondTimestamp = timestamp * 1000;
  if (millisecondTimestamp <= 0) {
    return '';
  }
  if (isToday(millisecondTimestamp)) {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(millisecondTimestamp);
  }

  if (isYesterday(millisecondTimestamp)) {
    return 'Yesterday';
  }

  if (isWithinLast7Days(millisecondTimestamp)) {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
    }).format(millisecondTimestamp);
  }

  if (isWithinYear(millisecondTimestamp)) {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
    }).format(millisecondTimestamp);
  }

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(millisecondTimestamp);
};

export const formatError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (!error) return '';

  return 'Unknown error';
};
