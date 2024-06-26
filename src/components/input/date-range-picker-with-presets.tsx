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
import { ComponentProps, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';

export interface StringDateRange {
  from: string | undefined;
  to?: string | undefined;
}

export const DateRangePickerWithPresets = ({
  initialDateRange,
  onChange,
  options,
  buttonSize,
  placeholder,
  presetPlaceholder,
  mode,
}: {
  options: { [label: string]: DateRange };
  buttonSize?: ComponentProps<typeof Button>['size'];
  placeholder?: string;
  presetPlaceholder?: string;
} & (
  | {
      mode: 'date';
      initialDateRange?: DateRange;
      onChange?: (value: DateRange | undefined) => void;
    }
  | {
      mode: 'string';
      initialDateRange?: StringDateRange;
      onChange?: (value: StringDateRange | undefined) => void;
    }
)) => {
  const [date, setDate] = useState<DateRange | StringDateRange | undefined>(initialDateRange);
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const handleOnSelect = (value: DateRange | undefined) => {
    setDate(value);
    if (mode === 'date') {
      onChange?.(value);
    } else {
      onChange?.(
        value
          ? {
              from: dayjs(value.from).toISOString(),
              to: value.to ? dayjs(value.to).toISOString() : undefined,
            }
          : value
      );
    }
  };

  const buttonLabel = useMemo(() => {
    if (selectedPreset && selectedPreset !== 'All') {
      return selectedPreset;
    }

    if (date?.from && date.to) {
      return (
        <>
          {dayjs(date.from).format('MMM D, YYYY')} - {dayjs(date.to).format('MMM D, YYYY')}
        </>
      );
    }

    if (date?.from && !date.to) {
      return dayjs(date.from).format('MMM D, YYYY');
    }

    return placeholder || 'Pick a date';
  }, [date?.from, date?.to, placeholder, selectedPreset]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size={buttonSize}
          variant="outline"
          className={cn('justify-start text-left font-normal', !date && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-auto flex-col space-y-2 p-2">
        <Select
          value={selectedPreset}
          onValueChange={(value) => {
            handleOnSelect(options[value as keyof typeof options]);
            setOpen(false);
            setSelectedPreset(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={presetPlaceholder || 'Select a date preset'} />
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
            selected={date as DateRange}
            defaultMonth={date?.from as Date | undefined}
            onSelect={(value) => {
              handleOnSelect(
                value
                  ? {
                      from: dayjs(value.from).startOf('day').toDate(),
                      to: value.to ? dayjs(value.to).endOf('day').toDate() : undefined,
                    }
                  : value
              );
              setSelectedPreset('');
            }}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
