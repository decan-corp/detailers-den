import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Role } from 'src/constants/common';
import { userSchema } from 'src/schemas/users';

import { roleOptions } from './data-table-options';

import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

const BaseUserForm = ({ form }: { form: UseFormReturn<z.input<typeof userSchema>> }) => (
  <>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem className="space-y-0">
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem className="space-y-0">
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem className="w-full space-y-0">
            <FormLabel>Role</FormLabel>
            <Select
              onValueChange={(value) => form.setValue('role', value as Role)}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {roleOptions.map(({ value, label, icon: Icon }) => (
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
        control={form.control}
        name="serviceCutPercentage"
        render={({ field }) => (
          <FormItem className="w-full space-y-0">
            <FormLabel>Service Cut %</FormLabel>
            <FormControl>
              <Input type="number" {...field} value={field.value ?? 0} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </>
);

export default BaseUserForm;
