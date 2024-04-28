import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
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
import { LocalStorageKey } from 'src/constants/storage-keys';
import { useRecentOptions } from 'src/hooks/use-recent-options';
import { useCrewOptions } from 'src/queries/users';
import { transactionSchema } from 'src/schemas/transactions';

import { createId } from '@paralleldrive/cuid2';
import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';

export const defaultTransactionCrewItem = { id: createId() };
const ServiceOption = ({
  id,
  crewName,
  role,
}: {
  id: string;
  crewName: string;
  role?: string | null;
}) => (
  <SelectItem value={id}>
    {crewName} - {role?.slice(0, 100 - crewName.length)}
  </SelectItem>
);

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

  const options = optionsRef.filter(
    ({ id }) => id === serviceBy.crewId || !selectedCrews.includes(id)
  );

  const mostRecentOptions = options.filter((option) => storedRecentSelections.includes(option.id));
  const leastRecentOptions = options.filter(
    (option) => !storedRecentSelections.includes(option.id)
  );

  const hasBothOptions = mostRecentOptions.length > 0 && leastRecentOptions.length > 0;

  return (
    <FormField
      control={form.control}
      name={`transactionServices.${serviceIndex}.serviceBy.${index}.crewId`}
      disabled={isFetching}
      render={({ field }) => (
        <FormItem>
          <Select onValueChange={(value) => onSelect(value, index)} value={field.value || ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select crew..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                {hasBothOptions && (
                  <SelectLabel className="text-muted-foreground/60">Most Recent</SelectLabel>
                )}
                {mostRecentOptions.map(({ id, role, name }) => (
                  <ServiceOption key={id} id={id} crewName={name} role={role} />
                ))}
              </SelectGroup>
              {hasBothOptions && <Separator className="my-1" />}
              <SelectGroup>
                {leastRecentOptions.map(({ id, role, name }) => (
                  <ServiceOption key={id} id={id} crewName={name} role={role} />
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

export default SelectCrewField;
