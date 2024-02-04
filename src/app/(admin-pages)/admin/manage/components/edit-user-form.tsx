import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { updateUser } from 'src/actions/users/update-user';
import { Entity } from 'src/constants/entities';
import { updateUserSchema, userSchema } from 'src/schemas/users';
import { handleSafeActionError } from 'src/utils/error-handling';

import BaseUserForm from './base-user-form';
import { useUserFormStore } from './data-form-dialog';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = updateUserSchema;
export type EditUserFormValues = z.input<typeof formSchema>;

const EditUserForm = ({ user }: { user?: EditUserFormValues }) => {
  const queryClient = useQueryClient();
  const userId = useUserFormStore((state) => state.userIdToEdit);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: user,
    shouldFocusError: true,
  });

  const { mutate: mutateUpdateUser, isPending: isSaving } = useMutation({
    mutationFn: updateUser,
    mutationKey: [Entity.Users, userId],
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Users] });
      toast.success('User updated successfully.');
      useUserFormStore.setState({ isDialogOpen: false, userIdToEdit: null });
    },
  });

  const onSubmit = (event: EditUserFormValues) => {
    mutateUpdateUser(event);
  };

  if (!user) {
    return <div className="flex h-96 items-center justify-center">User not found</div>;
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <BaseUserForm form={form as unknown as UseFormReturn<z.input<typeof userSchema>>} />

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

export default EditUserForm;
