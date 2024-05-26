import { Button } from '@/components/ui/button';
import { transactionSchema } from 'src/schemas/transactions';

import CrewFormItem from './crew-form-item';
import { makeDefaultServiceByItem } from './service-list';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { cloneDeep } from 'lodash';
import { PlusCircleIcon } from 'lucide-react';
import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';

const CrewList = ({
  serviceIndex,
  form,
}: {
  serviceIndex: number;
  form: UseFormReturn<z.input<typeof transactionSchema>>;
}) => {
  const [parent] = useAutoAnimate({
    duration: 250,
  });
  const watchedData = useWatch();

  const formState = useMemo(
    () => ({
      ...watchedData,
      ...form.getValues(),
    }),
    [form, watchedData]
  );

  const serviceState = formState.transactionServices[serviceIndex];

  const onAddCrew = () => {
    const serviceBy = cloneDeep(serviceState.serviceBy);
    const defaultServiceByItem = makeDefaultServiceByItem();

    serviceBy.push(defaultServiceByItem);
    form.setValue(`transactionServices.${serviceIndex}.serviceBy`, serviceBy);
  };

  const crewListError = form.formState.errors.transactionServices?.[serviceIndex]?.serviceBy?.root;

  return (
    <div className="space-y-4">
      <div>
        <div className="font-semibold">Assign Crews</div>
        {crewListError && (
          <div className="text-sm font-medium text-destructive">{crewListError.message}</div>
        )}
      </div>
      <div className="space-y-2" ref={parent}>
        {serviceState.serviceBy.map(({ id }, index) => (
          <CrewFormItem key={id || index} index={index} serviceIndex={serviceIndex} form={form} />
        ))}
      </div>
      <Button className="w-full" type="button" variant="outline" onClick={onAddCrew}>
        <PlusCircleIcon className="mr-1 size-4 text-muted-foreground" />
        Add Crew
      </Button>
    </div>
  );
};

export default CrewList;
