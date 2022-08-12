export const isToday = (timestamp: number) => {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const timestampDayStart = new Date(timestamp).setHours(0, 0, 0, 0);

  return todayStart === timestampDayStart;
};

export const isYesterday = (timestamp: number) => {
  const today = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return yesterday.toDateString() === today.toDateString();
};

export const isWithinLast7Days = (timestamp: number) => {
  const startOfLast7DaysTime = new Date();
  startOfLast7DaysTime.setDate(startOfLast7DaysTime.getDate() - 6);
  startOfLast7DaysTime.setHours(0, 0, 0, 0);
  const startOfLast7DaysTimestamp = Math.floor(startOfLast7DaysTime.getTime());
  return timestamp >= startOfLast7DaysTimestamp;
};

export const isWithinYear = (timestamp: number) => {
  const timestampYear = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
  }).format(timestamp);

  const curYear = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
  }).format();

  console.log(curYear);

  return timestampYear === curYear;
};
