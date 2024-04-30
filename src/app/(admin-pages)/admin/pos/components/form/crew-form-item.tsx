import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';
import useClientSession from 'src/hooks/use-client-session';
import { transactionSchema } from 'src/schemas/transactions';

import SelectCrewField from './select-crew-field';

import { XIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';

const CrewFormItem = ({
  index,
  serviceIndex,
  form,
}: {
  index: number;
  serviceIndex: number;
  form: UseFormReturn<z.input<typeof transactionSchema>>;
}) => {
  const watchedData = useWatch();
  const pathname = usePathname();
  const { data: session } = useClientSession();

  const isEdit = pathname.startsWith(AdminRoute.EditTransaction);

  const formState = useMemo(
    () => ({
      ...watchedData,
      ...form.getValues(),
    }),
    [form, watchedData]
  );

  const onDelete = () => {
    const state = [...formState.transactionServices];
    state[serviceIndex].serviceBy.splice(index, 1);
    form.setValue('transactionServices', state);
  };

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex place-content-between">
        <div className="text-sm font-semibold">Crew #{index + 1}</div>
        <Button
          variant="ghost"
          type="button"
          size="sm"
          disabled={formState.transactionServices[serviceIndex].serviceBy.length === 1}
          onClick={onDelete}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
      <SelectCrewField index={index} serviceIndex={serviceIndex} form={form} />
      {isEdit && session && [Role.Admin, Role.Cashier, Role.Accounting].includes(session.role) && (
        <FormField
          control={form.control}
          name={`transactionServices.${serviceIndex}.serviceBy.${index}.amount`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount Earned</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={0.01} {...field} value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default CrewFormItem;
