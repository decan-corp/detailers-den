import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RequiredIndicatorIcon } from 'src/components/form/required-indicator';
import { LocalStorageKey } from 'src/constants/storage-keys';
import { useRecentOptions } from 'src/hooks/use-recent-options';
import { useServiceOptions } from 'src/queries/services';
import { transactionSchema } from 'src/schemas/transactions';

import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';

const ServiceOption = ({
  id,
  serviceName,
  description,
}: {
  id: string;
  serviceName: string;
  description?: string | null;
}) => (
  <SelectItem value={id}>
    <span className="font-semibold">{serviceName}</span> -{' '}
    <span className="text-muted-foreground">{description?.slice(0, 100 - serviceName.length)}</span>
  </SelectItem>
);

const SelectServiceField = ({
  index,
  form,
}: {
  index: number;
  form: UseFormReturn<z.input<typeof transactionSchema>>;
}) => {
  const { data: optionsRef = [], isLoading: isFetching } = useServiceOptions();
  const { storedRecentSelections, saveRecentSelections } = useRecentOptions(
    LocalStorageKey.RecentSelectedService
  );

  const watchedData = useWatch();

  const formState = {
    ...watchedData,
    ...form.getValues(),
  };

  const serviceState = formState.transactionServices[index];
  const selectedServiceIds = formState.transactionServices.map(({ serviceId }) => serviceId);

  const derivedOptions = useMemo(
    () =>
      optionsRef.filter(({ priceMatrix }) =>
        priceMatrix.map(({ vehicleSize }) => vehicleSize).includes(formState.vehicleSize)
      ),
    [formState.vehicleSize, optionsRef]
  );

  const options = useMemo(
    () =>
      derivedOptions.filter(
        (option) => option.id === serviceState.serviceId || !selectedServiceIds.includes(option.id)
      ),
    [derivedOptions, serviceState.serviceId, selectedServiceIds]
  );

  const mostRecentOptions = useMemo(
    () => options.filter((option) => storedRecentSelections.includes(option.id)),
    [storedRecentSelections, options]
  );
  const leastRecentOptions = useMemo(
    () => options.filter((option) => !storedRecentSelections.includes(option.id)),
    [storedRecentSelections, options]
  );

  const hasBothOptions = mostRecentOptions.length > 0 && leastRecentOptions.length > 0;

  const onSelect = (serviceId: string, idx: number) => {
    form.setValue(`transactionServices.${idx}.serviceId`, serviceId);
    saveRecentSelections(serviceId);
  };

  return (
    <FormField
      control={form.control}
      name={`transactionServices.${index}.serviceId`}
      disabled={isFetching}
      render={({ field }) => (
        <FormItem className="w-full ">
          <FormLabel className="relative">
            Service <RequiredIndicatorIcon />
          </FormLabel>
          <Select onValueChange={(value) => onSelect(value, index)} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select service..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                {hasBothOptions && (
                  <SelectLabel className="text-muted-foreground/60">Most Recent</SelectLabel>
                )}
                {mostRecentOptions.map(({ id, serviceName, description }) => (
                  <ServiceOption
                    key={id}
                    id={id}
                    serviceName={serviceName}
                    description={description}
                  />
                ))}
              </SelectGroup>
              {hasBothOptions && <Separator className="my-1" />}
              <SelectGroup>
                {leastRecentOptions.map(({ id, serviceName, description }) => (
                  <ServiceOption
                    key={id}
                    id={id}
                    serviceName={serviceName}
                    description={description}
                  />
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectServiceField;
