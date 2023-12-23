/* eslint-disable no-restricted-syntax */
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { addUser } from 'src/actions/users/add-user';
import { getUser } from 'src/actions/users/get-users';
import { updateUser } from 'src/actions/users/update-user';
import RequiredIndicator from 'src/components/form/required-indicator';
import { Entity } from 'src/constants/entities';
import { users } from 'src/schema';
import { UserSelect } from 'src/types/schema';

import { rolesOptions } from './data-table-options';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ComponentProps, useState } from 'react';
import { twJoin } from 'tailwind-merge';
import { create } from 'zustand';

type UserValidationError = {
  [Field in keyof (UserSelect & { confirmPassword: string })]?: string;
};

export const useUserFormStore = create<{
  isDialogOpen: boolean;
  userIdToEdit: null | string;
}>(() => ({
  isDialogOpen: false,
  userIdToEdit: null,
}));

const UserForm = ({ userIdToEdit }: { userIdToEdit?: string | null }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [error, setError] = useState<UserValidationError>({});

  const isEdit = Boolean(userIdToEdit);

  const { data: user, isLoading: isFetchingUserToEdit } = useQuery({
    queryKey: [Entity.Users, userIdToEdit],
    queryFn: async () => {
      const { data, serverError, validationError } = await getUser(userIdToEdit as string);

      if (serverError || validationError) {
        toast({
          title: validationError ? 'Validation error' : 'Server Error',
          description: serverError || 'Invalid user id',
        });
      }

      return data;
    },
    enabled: !!userIdToEdit,
  });

  const { mutate: mutateAddUser, isPending: isAddingUser } = useMutation({
    mutationFn: addUser,
    mutationKey: [Entity.Users],
    onSuccess: async (result) => {
      if (result.validationError) {
        toast({
          title: 'Invalid Input',
          description:
            'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
          variant: 'destructive',
        });

        setError(result.validationError as UserValidationError);
        return;
      }

      if (result?.serverError) {
        toast({
          title: 'Something went wrong',
          description: result.serverError,
          variant: 'destructive',
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Users] });
      toast({
        title: 'Success!',
        description: 'User created successfully.',
      });
      useUserFormStore.setState({ isDialogOpen: false });
    },
  });

  const { mutate: mutateUpdateUser, isPending: isUpdatingUser } = useMutation({
    mutationFn: updateUser,
    mutationKey: [Entity.Users, userIdToEdit],
    onSuccess: async (result) => {
      if (result.validationError) {
        toast({
          title: 'Invalid Input',
          description:
            'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
          variant: 'destructive',
        });

        setError(result.validationError as UserValidationError);
        return;
      }

      if (result?.serverError) {
        toast({
          title: 'Something went wrong',
          description: result.serverError,
          variant: 'destructive',
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Users] });
      toast({
        title: 'Success!',
        description: 'User updated successfully.',
      });
      useUserFormStore.setState({ isDialogOpen: false, userIdToEdit: null });
    },
  });

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }

    if (userIdToEdit) {
      mutateUpdateUser({
        ...(payload as typeof users.$inferSelect),
        id: userIdToEdit,
      });
    } else {
      mutateAddUser(
        payload as typeof users.$inferInsert & { confirmPassword: string; password: string }
      );
    }
  };

  if (isEdit && isFetchingUserToEdit) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit' : 'Add'} User</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Edit' : 'Add new'} user here. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="name" className="col-span-2 flex justify-end">
            Name
            <RequiredIndicator />
          </Label>
          <Input
            id="name"
            name="name"
            required
            className="col-span-4"
            defaultValue={user?.name || ''}
          />
        </div>
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="email" className="col-span-2 flex justify-end">
            Email <RequiredIndicator />
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            required
            className="col-span-4"
            defaultValue={user?.email || ''}
          />
        </div>
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="role" className="col-span-2 flex justify-end">
            Role <RequiredIndicator />
          </Label>
          <Select required name="role" defaultValue={user?.role}>
            <SelectTrigger id="role" className="col-span-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rolesOptions.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex flex-row items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="grid grid-cols-6 items-center gap-4">
            <Label htmlFor="serviceCutPercentage" className="col-span-2 text-right">
              Service Cut %
            </Label>
            <Input
              id="serviceCutPercentage"
              name="serviceCutPercentage"
              defaultValue={user?.serviceCutPercentage || 0}
              type="number"
              min={0}
              max={99}
              className={twJoin(
                'col-span-4',
                error.serviceCutPercentage && 'border-destructive-200'
              )}
            />
          </div>
          {error.serviceCutPercentage && (
            <div className="grid grid-cols-6">
              <div className="col-span-4 col-start-3 ml-2 text-sm text-destructive dark:text-destructive-200">
                {error.serviceCutPercentage}
              </div>
            </div>
          )}
        </div>
        {!isEdit && (
          <>
            <div className="grid grid-cols-6 items-center gap-4">
              <Label htmlFor="password" className="col-span-2 flex justify-end">
                Password <RequiredIndicator />
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="col-span-4"
                minLength={6}
              />
            </div>
            <div>
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="confirmPassword" className="col-span-2 flex justify-end">
                  Confirm Password <RequiredIndicator />
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={twJoin(
                    'col-span-4',
                    error.confirmPassword && 'border-destructive-200'
                  )}
                  minLength={6}
                />
              </div>
              {error.confirmPassword && (
                <div className="grid grid-cols-6">
                  <div className="col-span-4 col-start-3 ml-2 text-sm text-destructive dark:text-destructive-200">
                    {error.confirmPassword}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={isAddingUser || isUpdatingUser || (!!userIdToEdit && isFetchingUserToEdit)}
        >
          {(isAddingUser || isUpdatingUser) && (
            <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save
        </Button>
      </DialogFooter>
    </form>
  );
};

export const UserFormDialog = () => {
  const isDialogOpen = useUserFormStore((state) => state.isDialogOpen);
  const userId = useUserFormStore((state) => state.userIdToEdit);

  const onOpenChange = (dialogOpen: boolean) => {
    useUserFormStore.setState({ isDialogOpen: dialogOpen });

    if (!dialogOpen) {
      useUserFormStore.setState({ userIdToEdit: null });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-min">
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[525px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <UserForm userIdToEdit={userId} />
      </DialogContent>
    </Dialog>
  );
};
