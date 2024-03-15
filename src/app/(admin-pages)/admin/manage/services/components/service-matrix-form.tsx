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
import { VehicleSize } from 'src/constants/common';

import { ServiceFormValues } from './service-form';

import { vehicleSizeOptions } from '../../../pos/components/data-table-options';

import { PlusCircleIcon, XIcon } from 'lucide-react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useImmer } from 'use-immer';

const ServiceMatrixForm = ({ form }: { form: UseFormReturn<ServiceFormValues> }) => {
  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: 'priceMatrix',
  });
  const [vehicleSizes, setVehicleSizes] = useImmer<VehicleSize[]>(() =>
    fields.map(({ vehicleSize }) => vehicleSize)
  );

  return (
    <div className="space-y-4">
      <div className="mb-2 text-base font-medium leading-none">Price Matrix:</div>
      <div className="space-y-4">
        {fields.map((item, index) => (
          <div key={item.id} className="space-y-2 rounded-lg border p-4">
            <div className="flex flex-row place-content-between items-center">
              <div className="font-semibold leading-none tracking-tight">Service {index + 1}</div>
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
                name={`priceMatrix.${index}.vehicleSize`}
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel>Vehicle Size</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setVehicleSizes((prevState) => {
                          prevState[index] = value as VehicleSize;
                        });
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleSizeOptions
                          .filter(
                            ({ value }) =>
                              value === vehicleSizes[index] || !vehicleSizes.includes(value)
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
                name={`priceMatrix.${index}.price`}
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
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
        disabled={fields.length === vehicleSizeOptions.length}
        onClick={() => append({ price: 0, vehicleSize: undefined as unknown as VehicleSize })}
        type="button"
      >
        <PlusCircleIcon className="h-4 w-4" /> Add Price Matrix
      </Button>
    </div>
  );
};

export default ServiceMatrixForm;
