import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RequiredIndicatorIcon } from 'src/components/form/required-indicator';
import { ComboBoxResponsive } from 'src/components/input/combobox-responsive';
import { LocalStorageKey } from 'src/constants/storage-keys';
import { useRecentOptions } from 'src/hooks/use-recent-options';
import { useCrewOptions } from 'src/queries/users';
import { transactionSchema } from 'src/schemas/transactions';

import { createId } from '@paralleldrive/cuid2';
import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';

export const defaultTransactionCrewItem = { id: createId() };

const SelectCrewField = ({
  index,
  serviceIndex,
  form,
}: {
  index: number;
  serviceIndex: number;
  form: UseFormReturn<z.input<typeof transactionSchema>>;
}) => {
  const { data: optionsRef = [], isLoading: isFetching } = useCrewOptions();
  const { storedRecentSelections, saveRecentSelections } = useRecentOptions(
    LocalStorageKey.RecentSelectedCrew
  );

  const watchedData = useWatch();

  const formState = useMemo(
    () => ({
      ...watchedData,
      ...form.getValues(),
    }),
    [form, watchedData]
  );

  const serviceState = formState.transactionServices[serviceIndex];
  const selectedCrews = serviceState.serviceBy.map(({ crewId: userId }) => userId);
  const serviceBy = serviceState.serviceBy[index] || {};

  const onSelect = (crewId: string, crewIdx: number) => {
    form.setValue(`transactionServices.${serviceIndex}.serviceBy.${crewIdx}.crewId`, crewId);
    saveRecentSelections(crewId);
  };

  const options = useMemo(
    () => optionsRef.filter(({ id }) => id === serviceBy.crewId || !selectedCrews.includes(id)),
    [optionsRef, selectedCrews, serviceBy.crewId]
  );

  const mostRecentOptions = useMemo(
    () => options.filter((option) => storedRecentSelections.includes(option.id)),
    [options, storedRecentSelections]
  );
  const leastRecentOptions = useMemo(
    () => options.filter((option) => !storedRecentSelections.includes(option.id)),
    [options, storedRecentSelections]
  );

  const groupedOptions = useMemo(() => {
    const mapBy = (option: (typeof optionsRef)[number]) => ({
      value: option.id,
      label: (
        <>
          <span className="font-semibold">{option.name}</span>
          <span className="mx-1">-</span>
          <span className="text-muted-foreground">{option.role}</span>
        </>
      ),
    });
    return {
      'Most Recent': mostRecentOptions.map(mapBy),
      Options: leastRecentOptions.map(mapBy),
    };
  }, [leastRecentOptions, mostRecentOptions]);

  return (
    <FormField
      control={form.control}
      name={`transactionServices.${serviceIndex}.serviceBy.${index}.crewId`}
      disabled={isFetching}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="relative">
            Crew <RequiredIndicatorIcon />
          </FormLabel>
          <ComboBoxResponsive
            value={field.value}
            onSelect={(value) => onSelect(value, index)}
            placeholder="Select crew..."
            groupedOptions={groupedOptions}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectCrewField;
