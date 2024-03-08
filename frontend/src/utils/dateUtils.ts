const isToday = (timestamp: number) => {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const timestampDayStart = new Date(timestamp).setHours(0, 0, 0, 0);

  return todayStart === timestampDayStart;
};

const isYesterday = (timestamp: number) => {
  const today = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return yesterday.toDateString() === today.toDateString();
};

const isWithinLast7Days = (timestamp: number) => {
  const startOfLast7DaysTime = new Date();
  startOfLast7DaysTime.setDate(startOfLast7DaysTime.getDate() - 6);
  startOfLast7DaysTime.setHours(0, 0, 0, 0);
  const startOfLast7DaysTimestamp = Math.floor(startOfLast7DaysTime.getTime());
  return timestamp >= startOfLast7DaysTimestamp;
};

const isWithinYear = (timestamp: number) => {
  const timestampYear = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
  }).format(timestamp);

  const curYear = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
  }).format();

  return timestampYear === curYear;
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
