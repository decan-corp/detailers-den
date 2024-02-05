import dayjs from 'dayjs';

export const DATE_RANGE_OPTIONS = {
  Today: {
    from: dayjs().startOf('day').toDate(),
    to: dayjs().endOf('day').toDate(),
  },
  Yesterday: {
    from: dayjs().subtract(1, 'day').startOf('day').toDate(),
    to: dayjs().subtract(1, 'day').endOf('day').toDate(),
  },
  'Current Week': {
    from: dayjs().startOf('week').toDate(),
    to: dayjs().endOf('week').toDate(),
  },
  'Last Week': {
    from: dayjs().subtract(1, 'week').startOf('week').toDate(),
    to: dayjs().subtract(1, 'week').endOf('week').toDate(),
  },
  'Current Month': {
    from: dayjs().startOf('month').toDate(),
    to: dayjs().endOf('month').toDate(),
  },
  'Last Month': {
    from: dayjs().subtract(1, 'month').startOf('month').toDate(),
    to: dayjs().subtract(1, 'month').endOf('month').toDate(),
  },
} as const;
