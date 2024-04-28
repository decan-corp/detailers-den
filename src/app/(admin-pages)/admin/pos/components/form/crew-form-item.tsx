import { Button } from '@/components/ui/button';
import { transactionSchema } from 'src/schemas/transactions';

import SelectCrewField from './select-crew-field';

import { XIcon } from 'lucide-react';
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
        <div className="text-sm font-medium">Crew #{index + 1}</div>
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
    </div>
  );
};

export default CrewFormItem;
