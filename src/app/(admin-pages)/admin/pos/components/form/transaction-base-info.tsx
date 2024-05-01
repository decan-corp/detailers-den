import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RequiredIndicatorIcon } from 'src/components/form/required-indicator';
import { ModeOfPayment, TransactionStatus, VehicleSize } from 'src/constants/common';
import { transactionSchema } from 'src/schemas/transactions';

import {
  modeOfPaymentOptions,
  transactionStatusOptions,
  vehicleSizeOptions,
} from '../data-table-options';

import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

const TransactionBaseInfo = ({
  form,
}: {
  form: UseFormReturn<z.input<typeof transactionSchema>>;
}) => (
  <div className="space-y-4">
    <FormField
      control={form.control}
      name="customerName"
      render={({ field }) => (
        <FormItem className="">
          <FormLabel>Customer Name</FormLabel>
          <FormControl>
            <Input {...field} value={field.value || ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="plateNumber"
        render={({ field }) => (
          <FormItem className="">
            <FormLabel className="relative">
              Plate Number <RequiredIndicatorIcon />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value || ''}
                minLength={6}
                maxLength={12}
                onKeyDown={(e) => {
                  if (e.code === 'Space') {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  field.onChange(e.currentTarget.value.toUpperCase());
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="vehicleSize"
        render={({ field }) => (
          <FormItem className="w-full ">
            <FormLabel className="relative">
              Vehicle Size <RequiredIndicatorIcon />
            </FormLabel>
            <Select
              onValueChange={(value) => form.setValue('vehicleSize', value as VehicleSize)}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle size..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {vehicleSizeOptions.map(({ value, label, icon: Icon }) => (
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
    </div>

    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem className="w-full ">
            <FormLabel className="relative">
              Status <RequiredIndicatorIcon />
            </FormLabel>
            <Select
              onValueChange={(value) => form.setValue('status', value as TransactionStatus)}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {transactionStatusOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="modeOfPayment"
        render={({ field }) => (
          <FormItem className="w-full ">
            <FormLabel className="relative">
              Mode of Payment <RequiredIndicatorIcon />
            </FormLabel>
            <Select
              onValueChange={(value) => form.setValue('modeOfPayment', value as ModeOfPayment)}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {modeOfPaymentOptions.map(({ value, label, icon: Icon }) => (
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
    </div>

    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="discount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Discount</FormLabel>
            <FormControl>
              <Input type="number" min={0} step={0.01} {...field} value={field.value || 0} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tip"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tip</FormLabel>
            <FormControl>
              <Input type="number" min={0} step={0.01} {...field} value={field.value || 0} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <FormField
      control={form.control}
      name="note"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Note</FormLabel>
          <FormControl>
            <Textarea {...field} className="[field-sizing:content]" value={field.value || ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

export default TransactionBaseInfo;
