import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequiredIndicatorIcon } from 'src/components/form/required-indicator';
import { CrewRole, Role } from 'src/constants/common';

import { ServiceFormValues, defaultServiceCutMatrix } from './service-form';

import { roleOptions } from '../../components/data-table-options';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { PlusCircleIcon, XIcon } from 'lucide-react';
import { useMemo } from 'react';
import { UseFormReturn, useFieldArray, useWatch } from 'react-hook-form';

const ServiceCutMatrixForm = ({ form }: { form: UseFormReturn<ServiceFormValues> }) => {
  const [parent] = useAutoAnimate();

  const watchedData = useWatch();

  const formState = useMemo(() => ({ ...watchedData, ...form.getValues() }), [form, watchedData]);

  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: 'serviceCutMatrix',
  });

  const selectedRoles = formState.serviceCutMatrix.map(({ role }) => role);

  const options = useMemo(
    () =>
      roleOptions.filter(({ value }) =>
        [Role.Crew, Role.StayInCrew, Role.Detailer].includes(value)
      ),
    []
  );

  return (
    <div className="space-y-4">
      <div className="mb-2 text-base font-medium leading-none">Service Cut Matrix:</div>
      <div ref={parent} className="space-y-4">
        {fields.map((item, index) => (
          <div key={item.id} className="space-y-2 rounded-lg border p-4">
            <div className="flex flex-row place-content-between items-center">
              <div className="font-semibold leading-none tracking-tight">
                Service Cut {index + 1}
              </div>
              <Button
                className="disabled:pointer-events-auto disabled:cursor-not-allowed"
                variant="ghost"
                type="button"
                size="sm"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`serviceCutMatrix.${index}.role`}
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className="relative">
                      Role <RequiredIndicatorIcon />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options
                          .filter(
                            ({ value }) =>
                              formState.serviceCutMatrix[index]?.role === value ||
                              !selectedRoles.includes(value as CrewRole)
                          )
                          .map(({ value, icon: Icon, label }) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex flex-row items-center gap-3">
                                <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                key={item.id}
                control={form.control}
                name={`serviceCutMatrix.${index}.cutPercentage`}
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel>Service Cut %</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={0} step={1} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        className="gap-2 text-center disabled:pointer-events-auto disabled:cursor-not-allowed"
        variant="outline"
        disabled={fields.length === options.length}
        onClick={() => append(defaultServiceCutMatrix)}
        type="button"
      >
        <PlusCircleIcon className="h-4 w-4" /> Add Service Cut Matrix
      </Button>
    </div>
  );
};

export default ServiceCutMatrixForm;
