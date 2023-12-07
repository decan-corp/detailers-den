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
import RequiredIndicator from 'src/components/form/required-indicator';
import { Entity } from 'src/constants/entities';
import { users } from 'src/schema';
import { UserSelect } from 'src/types/schema';

import { roles } from './data-table-options';

import { addUser } from '../actions';

import { useQueryClient } from '@tanstack/react-query';
import { atom, useAtom, useStore } from 'jotai';
import { ComponentProps, useState } from 'react';

type UserValidationError = { [Field in keyof UserSelect]?: string };

const isUserDialogOpenAtom = atom(false);

const UserForm = () => {
  const queryClient = useQueryClient();
  const store = useStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UserValidationError>({});

  const onSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
    event.preventDefault(); // always add prevent default for onSubmit action

    setError({});

    const formData = new FormData(event.currentTarget);

    const payload: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }

    const { password, confirmPassword, ...userInsertData } =
      payload as typeof users.$inferInsert & { confirmPassword: string; password: string };

    if (confirmPassword !== password) {
      toast({
        title: 'Password Mismatch',
        description:
          'The passwords you entered do not match. Please ensure that both passwords are identical before proceeding.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const result = await addUser({
      ...userInsertData,
      password,
    });

    setIsLoading(false);

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
    store.set(isUserDialogOpenAtom, false);
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <DialogHeader>
        <DialogTitle>Add User</DialogTitle>
        <DialogDescription>Add new user here. Click save when you&apos;re done.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="name" className="col-span-2 flex justify-end">
            Name
            <RequiredIndicator />
          </Label>
          <Input id="name" name="name" required className="col-span-4" />
        </div>
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="email" className="col-span-2 flex justify-end">
            Email <RequiredIndicator />
          </Label>
          <Input id="email" type="email" name="email" required className="col-span-4" />
        </div>
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="role" className="col-span-2 flex justify-end">
            Role <RequiredIndicator />
          </Label>
          <Select required name="role">
            <SelectTrigger className="col-span-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
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
              defaultValue={0}
              type="number"
              min={0}
              max={100}
              className="col-span-4"
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
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="password" className="col-span-2 flex justify-end">
            Password <RequiredIndicator />
          </Label>
          <Input id="password" name="password" type="password" required className="col-span-4" />
        </div>
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="confirmPassword" className="col-span-2 flex justify-end">
            Confirm Password <RequiredIndicator />
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="col-span-4"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
};

export const UserFormDialog = () => {
  const [isUserDialogOpen, setIsUserDialogOpen] = useAtom(isUserDialogOpenAtom);

  return (
    <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <UserForm />
      </DialogContent>
    </Dialog>
  );
};
