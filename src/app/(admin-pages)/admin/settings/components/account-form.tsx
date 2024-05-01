import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { updateAccount } from 'src/actions/account/update';
import RequiredIndicator from 'src/components/form/required-indicator';
import { Entity } from 'src/constants/entities';
import { updateAccountSchema } from 'src/schemas/users';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import lodash from 'lodash';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = updateAccountSchema;

type FormValues = z.input<typeof formSchema>;

export const ProfileForm = ({ profile }: { profile?: FormValues }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: profile,
  });

  const { mutate: update, isPending } = useMutation({
    mutationFn: updateAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [Entity.Users] });
      toast.success('Account updated successfully.');

      router.refresh();
    },
  });

  const onSubmit = (payload: FormValues) => {
    update(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-[1px]">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex">
                Email <RequiredIndicator />
              </FormLabel>
              <FormControl>
                <Input placeholder="Your email" type="email" {...field} />
              </FormControl>
              <FormDescription>Email used to log in to your account.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          disabled
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex">
                Role <RequiredIndicator />
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Email used to log in to your account.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex">
                Name <RequiredIndicator />
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending || lodash.isEmpty(form.formState.dirtyFields)}>
          {isPending && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
          Update Profile
        </Button>
      </form>
    </Form>
  );
};
