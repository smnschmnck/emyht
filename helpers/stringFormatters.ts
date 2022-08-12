import fallBackProfilePictureURL from '../assets/images/fallback-pp.webp';
import {
  isToday,
  isWithinLast7Days,
  isWithinYear,
  isYesterday,
} from './dateUtils';

export const formatPicURL = (profilePictureUrl?: string) => {
  if (!profilePictureUrl) {
    return fallBackProfilePictureURL;
  }
  const defaultPpRegeEx = /^default_[0-9]$/i;
  if (profilePictureUrl.match(defaultPpRegeEx)) {
    const num = profilePictureUrl.replace('default_', '');
    return '/default_profile_pictures/default_' + num + '.png';
  }
  return profilePictureUrl;
};

export const formatTimestamp = (timestamp: number) => {
  const millisecondTimestamp = timestamp * 1000;
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
