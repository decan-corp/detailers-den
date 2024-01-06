import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMediaQuery } from '@/hooks/use-media-query';

import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface Option {
  value: string;
  label: string;
}

const List = ({
  setOpen,
  onSelect,
  options,
}: {
  setOpen: (open: boolean) => void;
  onSelect: (value: Option['value']) => void;
  options: Option[];
}) => (
  <Command>
    <CommandInput placeholder="Search" />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup>
        {options.map((option) => (
          <CommandItem
            key={option.value}
            value={option.value}
            onSelect={(selectValue) => {
              onSelect(selectValue);
              setOpen(false);
            }}
          >
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  </Command>
);

export const ComboBoxResponsive = ({
  className,
  defaultValue,
  options,
  placeholder,
  onSelect,
  error,
}: {
  className?: string;
  defaultValue?: Option['value'];
  options: Option[];
  placeholder?: string;
  onSelect: (value: Option['value']) => void;
  error?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedValue, setSelectedStatus] = useState<Option['value'] | undefined>(defaultValue);

  const handleOnSelect = (value: Option['value']) => {
    setSelectedStatus(value);
    onSelect(value);
  };

  const selectedOption = options.find((option) => option.value === selectedValue);

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={twMerge(
              'relative w-full justify-start',
              className,
              error && 'mb-4 border-destructive'
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <div className="absolute top-10 text-xs text-destructive dark:text-destructive-200">
              {error}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <List options={options} setOpen={setOpen} onSelect={handleOnSelect} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={twMerge(
            'relative w-full justify-start',
            className,
            error && 'mb-4 border-destructive'
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <div className="absolute top-10 text-xs text-destructive dark:text-destructive-200">
            {error}
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <List options={options} setOpen={setOpen} onSelect={handleOnSelect} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
