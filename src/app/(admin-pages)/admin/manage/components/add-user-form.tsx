import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { addUser } from 'src/actions/users/add-user';
import { Entity } from 'src/constants/entities';
import { createUserSchema, userSchema } from 'src/schemas/users';
import { handleSafeActionError } from 'src/utils/error-handling';

import BaseUserForm from './base-user-form';
import { useUserFormStore } from './data-form-dialog';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = createUserSchema;
export type AddUserFormValues = z.input<typeof formSchema>;

const defaultValues: Partial<AddUserFormValues> = {
  serviceCutPercentage: 0,
};

const AddUserForm = () => {
  const queryClient = useQueryClient();

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    shouldFocusError: true,
  });

  const { mutate: mutateAddUser, isPending: isSaving } = useMutation({
    mutationFn: addUser,
    mutationKey: [Entity.Users],
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Users] });
      toast.success('User created successfully.');
      useUserFormStore.setState({ isDialogOpen: false });
    },
  });

  const onSubmit = (event: AddUserFormValues) => {
    mutateAddUser(event);
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <BaseUserForm form={form as unknown as UseFormReturn<z.input<typeof userSchema>>} />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AddUserForm;
