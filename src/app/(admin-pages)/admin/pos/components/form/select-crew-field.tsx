import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RequiredIndicatorIcon } from 'src/components/form/required-indicator';
import { ComboBoxResponsive } from 'src/components/input/combobox-responsive';
import { CrewRole, Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';
import { LocalStorageKey } from 'src/constants/storage-keys';
import useClientSession from 'src/hooks/use-client-session';
import { useRecentOptions } from 'src/hooks/use-recent-options';
import { useServiceOptions } from 'src/queries/services';
import { useCrewOptions } from 'src/queries/users';
import { transactionSchema } from 'src/schemas/transactions';
import { computeCrewEarnedAmount } from 'src/utils/formula';

import { createId } from '@paralleldrive/cuid2';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
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
  const pathname = usePathname();
  const { data: session, isLoading: isFetchingSession } = useClientSession();
  const { data: optionsRef = [], isLoading: isFetching } = useCrewOptions();
  const { data: serviceOptions = [], isLoading: isFetchingService } = useServiceOptions();
  const { storedRecentSelections, saveRecentSelections } = useRecentOptions(
    LocalStorageKey.RecentSelectedCrew
  );

  const isEdit = pathname.startsWith(AdminRoute.EditTransaction);

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

  const selectedService = useMemo(
    () => serviceOptions.find(({ id }) => id === serviceState.serviceId),
    [serviceOptions, serviceState.serviceId]
  );

  const allowedRoles = useMemo(() => {
    const roles = selectedService?.serviceCutMatrix.map(({ role }) => role);

    return roles || [];
  }, [selectedService?.serviceCutMatrix]);

  const onSelect = (crewId: string, crewIdx: number) => {
    form.setValue(`transactionServices.${serviceIndex}.serviceBy.${crewIdx}.crewId`, crewId);
    saveRecentSelections(crewId);

    if (isEdit && [Role.Admin, Role.Accountant].includes(session?.role as Role)) {
      const selectedCrew = optionsRef.find(({ id }) => id === crewId);
      const priceMatrix = selectedService?.priceMatrix.find(
        ({ vehicleSize }) => vehicleSize === formState.vehicleSize
      );
      const serviceCutMatrix = selectedService?.serviceCutMatrix.find(
        ({ role }) => role === selectedCrew?.role
      );

      if (!priceMatrix) {
        toast.error('Missing price matrix.');
        return;
      }
      const { amount } = computeCrewEarnedAmount({
        servicePrice: priceMatrix.price,
        numberOfCrews: serviceState.serviceBy.length,
        serviceCutPercentage:
          (serviceCutMatrix?.cutPercentage || 0) + (selectedCrew?.serviceCutModifier || 0),
      });
      form.setValue(
        `transactionServices.${serviceIndex}.serviceBy.${crewIdx}.amount`,
        amount.toFixed(2)
      );
    }
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
    const mapBy = (option: (typeof optionsRef)[number]) => {
      const isDisabled = !allowedRoles.includes(option.role as CrewRole);
      return {
        value: option.id,
        disabled: isDisabled,
        label: (
          <div className="space-x-2">
            <span className="font-semibold">{option.name}</span>
            <span>-</span>
            <span className="font-medium text-muted-foreground">{option.role}</span>
            {isDisabled && (
              <span className="text-muted-foreground">(not allowed for this service)</span>
            )}
          </div>
        ),
      };
    };
    return {
      'Most Recent': mostRecentOptions.map(mapBy),
      Options: leastRecentOptions.map(mapBy),
    };
  }, [allowedRoles, leastRecentOptions, mostRecentOptions]);

  return (
    <FormField
      control={form.control}
      name={`transactionServices.${serviceIndex}.serviceBy.${index}.crewId`}
      disabled={isFetching || isFetchingService || isFetchingSession || !selectedService}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="relative">
            Crew <RequiredIndicatorIcon />
          </FormLabel>
          <ComboBoxResponsive
            {...field}
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
