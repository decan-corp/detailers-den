'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { CalendarIcon } from '@radix-ui/react-icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

const options = {
  Today: { from: dayjs().startOf('day').toDate(), to: dayjs().endOf('day').toDate() },
  'Current Week': { from: dayjs().startOf('week').toDate(), to: dayjs().endOf('week').toDate() },
  'Last Week': {
    from: dayjs().startOf('week').subtract(1, 'week').toDate(),
    to: dayjs().endOf('week').subtract(1, 'week').toDate(),
  },
  'Current Month': { from: dayjs().startOf('month').toDate(), to: dayjs().endOf('month').toDate() },
  'Last Month': {
    from: dayjs().startOf('month').subtract(1, 'month').toDate(),
    to: dayjs().endOf('month').subtract(1, 'month').toDate(),
  },
};

export const DateRangePickerWithPresets = ({
  initialDateRange,
  onChange,
}: {
  initialDateRange?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
}) => {
  const [date, setDate] = useState<DateRange | undefined>(
    initialDateRange || {
      from: dayjs().day(-2).startOf('day').toDate(),
      to: dayjs().day(4).endOf('day').toDate(),
    }
  );

  const handleOnSelect = (value: DateRange | undefined) => {
    setDate(value);
    onChange?.(value);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'min-w-[240px] max-w-[300px] justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from && date.to && (
            <>
              {dayjs(date.from).format('MMM D, YYYY')} - {dayjs(date.to).format('MMM D, YYYY')}
            </>
          )}

          {date?.from && !date.to && dayjs(date.from).format('MMM D, YYYY')}
          {!date && <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-auto flex-col space-y-2 p-2">
        <Select onValueChange={(value) => handleOnSelect(options[value as keyof typeof options])}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent position="popper">
            {Object.keys(options).map((label) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <Calendar
            mode="range"
            selected={date}
            defaultMonth={date?.from}
            onSelect={(value) =>
              handleOnSelect(
                value
                  ? {
                      from: dayjs(value.from).startOf('day').toDate(),
                      to: value.to ? dayjs(value.to).endOf('day').toDate() : undefined,
                    }
                  : value
              )
            }
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
