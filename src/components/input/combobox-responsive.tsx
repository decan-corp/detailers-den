/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
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
import { cn } from '@/lib/utils';

import { CheckIcon } from 'lucide-react';
import { Children, isValidElement, useCallback, useMemo, useState } from 'react';
import { twJoin } from 'tailwind-merge';

interface Option {
  value: string;
  label: string | JSX.Element;
  disabled?: boolean;
}

export interface GroupedOptions {
  [groupLabel: string]: Option[];
}

interface ListProps {
  onSelect?: (value: Option['value']) => void;
  groupedOptions: GroupedOptions;
  value: Option['value'];
}

const extractTextFromJSX = (element: Option['label']): string => {
  if (typeof element === 'string') {
    return element;
  }
  if (isValidElement(element)) {
    // Recursively extract text from children
    return Children.toArray((element.props as { children: JSX.Element[] })?.children || [])
      .map((child) => extractTextFromJSX(child as string))
      .join('');
  }
  return '';
};

const List = ({ onSelect, groupedOptions, value }: ListProps) => {
  const [search, setSearch] = useState('');

  const filteredGroup = useMemo(() => {
    if (!search.trim()) {
      return groupedOptions;
    }
    const results: GroupedOptions = {};

    for (const groupKey in groupedOptions) {
      if (!groupedOptions[groupKey]) continue;
      const options = groupedOptions[groupKey];

      for (const option of options) {
        const textContent = extractTextFromJSX(option.label);

        if (textContent.toLowerCase().includes(search.toLowerCase())) {
          if (!results[groupKey]) {
            results[groupKey] = [option];
          } else {
            results[groupKey].push(option);
          }
        }
      }
    }

    return results;
  }, [groupedOptions, search]);

  return (
    <Command shouldFilter={false}>
      <CommandInput placeholder="Search..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(filteredGroup).map(([groupLabel, options]) =>
          options.length === 0 ? null : (
            <CommandGroup key={groupLabel} heading={groupLabel}>
              {options.map((option) => (
                <CommandItem
                  className={twJoin(
                    'max-w-[600px]',
                    option.disabled && 'cursor-not-allowed opacity-45'
                  )}
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={(selectValue) => {
                    onSelect?.(selectValue);
                  }}
                >
                  <div className="w-full">{option.label}</div>
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          )
        )}
      </CommandList>
    </Command>
  );
};

export const ComboBoxResponsive = ({
  onSelect,
  groupedOptions,
  value,
  placeholder,
  disabled,
}: Omit<ListProps, 'setOpen'> & { value: string; placeholder?: string; disabled?: boolean }) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const selectedOption = useMemo(() => {
    let result: Option | undefined;

    for (const key in groupedOptions) {
      if (!groupedOptions[key]) continue;
      const options = groupedOptions[key];

      for (const option of options) {
        if (option.value === value) {
          result = option;
          break;
        }
      }
    }
    return result;
  }, [groupedOptions, value]);

  const handleSelect = useCallback(
    (data: Option['value']) => {
      onSelect?.(data);
      setOpen(false);
    },
    [onSelect]
  );

  const label = useMemo(() => {
    if (selectedOption) {
      return selectedOption.label;
    }

    return placeholder || 'Select...';
  }, [placeholder, selectedOption]);

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start overflow-hidden"
            disabled={disabled}
          >
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[518px] p-0" align="start">
          <List onSelect={handleSelect} groupedOptions={groupedOptions} value={value} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start overflow-hidden"
          disabled={disabled}
        >
          {label}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 min-h-[40vh] border-t">
          <List onSelect={handleSelect} groupedOptions={groupedOptions} value={value} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
