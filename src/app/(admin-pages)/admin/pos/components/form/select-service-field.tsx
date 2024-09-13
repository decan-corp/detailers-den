import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RequiredIndicatorIcon } from 'src/components/form/required-indicator';
import { ComboBoxResponsive } from 'src/components/input/combobox-responsive';
import { CrewRole } from 'src/constants/common';
import { LocalStorageKey } from 'src/constants/storage-keys';
import { useRecentOptions } from 'src/hooks/use-recent-options';
import { useServiceOptions } from 'src/queries/services';
import { useCrewOptions } from 'src/queries/users';
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
  const { data: crewOptions = [], isLoading: isFetchingCrew } = useCrewOptions();
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

  const options = useMemo(
    () =>
      optionsRef.filter(
        (option) => option.id === serviceState.serviceId || !selectedServiceIds.includes(option.id)
      ),
    [optionsRef, serviceState.serviceId, selectedServiceIds]
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

      const isDisabled = price === undefined;
      return {
        value: option.id,
        disabled: isDisabled,
        label: (
          <div className="space-x-2">
            <span className="font-semibold">{option.serviceName}</span>
            <span className="font-medium text-muted-foreground">{formatAmount(price || 0)}</span>
            {isDisabled && <span className="text-muted-foreground">(not allowed)</span>}
            <span>-</span>
            <span className="text-muted-foreground">{option.description}</span>
          </div>
        ),
      };
    };
    return {
      'Most Recent': mostRecentOptions.map(mapBy),
      Options: leastRecentOptions.map(mapBy),
    };
  }, [formState.vehicleSize, leastRecentOptions, mostRecentOptions]);

  const onSelect = (serviceId: string, idx: number) => {
    const service = optionsRef.find(({ id }) => id === serviceId);
    const priceMatrix = service?.priceMatrix.find(
      ({ vehicleSize }) => vehicleSize === formState.vehicleSize
    );

    if (!service || !priceMatrix) {
      toast.error('Missing service/price matrix.');
      return;
    }

    const allowedRoles = service.serviceCutMatrix.map(({ role }) => role);

    const { serviceBy } = formState.transactionServices[index];

    const filteredServiceBy = serviceBy.filter(({ crewId }) => {
      // allow an empty crew form
      if (!crewId) return true;
      const crew = crewOptions.find(({ id }) => id === crewId);

      return allowedRoles.includes(crew?.role as CrewRole);
    });

    form.setValue(`transactionServices.${idx}.serviceId`, serviceId);
    form.setValue(`transactionServices.${idx}.price`, priceMatrix.price.toFixed(2));
    form.setValue(`transactionServices.${idx}.serviceBy`, filteredServiceBy);
    saveRecentSelections(serviceId);
  };

  return (
    <FormField
      control={form.control}
      name={`transactionServices.${index}.serviceId`}
      disabled={isFetching || isFetchingCrew}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="relative">
            Service <RequiredIndicatorIcon />
          </FormLabel>
          <ComboBoxResponsive
            {...field}
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
