import dayjs from 'dayjs';

export const DATE_RANGE_OPTIONS = {
  Today: {
    from: dayjs().startOf('day').toDate(),
    to: dayjs().endOf('day').toDate(),
  },
  'Current Week': {
    from: dayjs().startOf('week').toDate(),
    to: dayjs().endOf('week').toDate(),
  },
  'Last Week': {
    from: dayjs().startOf('week').subtract(1, 'week').toDate(),
    to: dayjs().endOf('week').subtract(1, 'week').toDate(),
  },
  'Current Month': {
    from: dayjs().startOf('month').toDate(),
    to: dayjs().endOf('month').toDate(),
  },
  'Last Month': {
    from: dayjs().startOf('month').subtract(1, 'month').toDate(),
    to: dayjs().endOf('month').subtract(1, 'month').toDate(),
  },
};
