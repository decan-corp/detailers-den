import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getUser } from 'src/actions/users/get-users';
import { Entity } from 'src/constants/entities';

import AddUserForm from './add-user-form';
import EditUserForm from './edit-user-form';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { create } from 'zustand';

export const useUserFormStore = create<{
  isDialogOpen: boolean;
  userIdToEdit: null | string;
}>(() => ({
  isDialogOpen: false,
  userIdToEdit: null,
}));

export const UserFormDialog = () => {
  const isDialogOpen = useUserFormStore((state) => state.isDialogOpen);
  const userId = useUserFormStore((state) => state.userIdToEdit);

  const { data: user, isLoading: isFetching } = useQuery({
    queryKey: [Entity.Users, userId],
    queryFn: async () => {
      const { data, serverError, validationErrors } = await getUser(userId as string);

      if (serverError || validationErrors) {
        toast.error(validationErrors ? 'Validation error' : 'Server Error', {
          description: serverError || 'Invalid user id',
        });
      }

      return data;
    },
    enabled: !!userId,
  });

  const onOpenChange = (dialogOpen: boolean) => {
    useUserFormStore.setState({ isDialogOpen: dialogOpen });

    if (!dialogOpen) {
      useUserFormStore.setState({ userIdToEdit: null });
    }
  };

  const isEdit = Boolean(userId);

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
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Add'} User</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Edit' : 'Add new'} user here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        {!isEdit && <AddUserForm />}
        {isEdit &&
          (isFetching ? (
            <div className="flex h-96 items-center justify-center">
              <span className="loading loading-ring loading-lg text-foreground" />
            </div>
          ) : (
            <EditUserForm user={user} />
          ))}
      </DialogContent>
    </Dialog>
  );
};
