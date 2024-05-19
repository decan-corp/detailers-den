import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RequiredIndicatorIcon } from 'src/components/form/required-indicator';
import { ComboBoxResponsive } from 'src/components/input/combobox-responsive';
import { LocalStorageKey } from 'src/constants/storage-keys';
import { useRecentOptions } from 'src/hooks/use-recent-options';
import { useServiceOptions } from 'src/queries/services';
import { transactionSchema } from 'src/schemas/transactions';
import { formatAmount } from 'src/utils/format';

import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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

  const filteredBySize = useMemo(
    () =>
      optionsRef.filter(({ priceMatrix }) =>
        priceMatrix.map(({ vehicleSize }) => vehicleSize).includes(formState.vehicleSize)
      ),
    [formState.vehicleSize, optionsRef]
  );

  const options = useMemo(
    () =>
      filteredBySize.filter(
        (option) => option.id === serviceState.serviceId || !selectedServiceIds.includes(option.id)
      ),
    [filteredBySize, serviceState.serviceId, selectedServiceIds]
  );

  const mostRecentOptions = useMemo(
    () => options.filter((option) => storedRecentSelections.includes(option.id)),
    [storedRecentSelections, options]
  );
  const leastRecentOptions = useMemo(
    () => options.filter((option) => !storedRecentSelections.includes(option.id)),
    [storedRecentSelections, options]
  );

  const groupedOptions = useMemo(() => {
    const mapBy = (option: (typeof optionsRef)[number]) => {
      const { price } =
        option.priceMatrix.find(({ vehicleSize }) => vehicleSize === formState.vehicleSize) || {};
      return {
        value: option.id,
        label: (
          <>
            <span className="font-semibold">{option.serviceName}</span>
            <span className="mx-1 text-muted-foreground">{formatAmount(price || 0)}</span>
            <span className="mx-1">-</span>
            <span className="text-muted-foreground">{option.description}</span>
          </>
        ),
      };
    };
    return {
      'Most Recent': mostRecentOptions.map(mapBy),
      Options: leastRecentOptions.map(mapBy),
    };
  }, [formState.vehicleSize, leastRecentOptions, mostRecentOptions]);

  const onSelect = (serviceId: string, idx: number) => {
    const service = filteredBySize.find(({ id }) => id === serviceId);
    const priceMatrix = service?.priceMatrix.find(
      ({ vehicleSize }) => vehicleSize === formState.vehicleSize
    );

    if (!service || !priceMatrix) {
      toast.error('Missing service/price matrix.');
      return;
    }

    form.setValue(`transactionServices.${idx}.serviceId`, serviceId);
    form.setValue(`transactionServices.${idx}.price`, priceMatrix.price);
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
          <ComboBoxResponsive
            value={field.value}
            onSelect={(value) => onSelect(value, index)}
            placeholder="Select service..."
            groupedOptions={groupedOptions}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectServiceField;
