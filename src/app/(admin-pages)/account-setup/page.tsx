'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { setupPassword } from 'src/actions/auth/setup-password';
import { AdminRoute } from 'src/constants/routes';
import { setupPasswordSchema } from 'src/schemas/auth';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = setupPasswordSchema;
type FormValues = z.input<typeof formSchema>;

const AccountSetup = () => {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    shouldFocusError: true,
  });

  const { mutate: mutateSetupPassword, isPending } = useMutation({
    mutationFn: setupPassword,
    onSuccess: (result) => {
      if (result.validationErrors) {
        toast.error('Invalid Input', {
          description:
            'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
        });
        return;
      }

      if (result?.serverError) {
        toast.error('Something went wrong', {
          description: result.serverError,
        });
        return;
      }

      toast.success('Account secured successfully!');

      setTimeout(() => {
        router.replace(AdminRoute.Login);
      }, 1000);
    },
  });

  const onSubmit = (event: FormValues) => {
    mutateSetupPassword(event);
  };

  return (
    <div className="flex h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl">Secure Your Account</CardTitle>
              <CardDescription className="text-center">
                Create a strong password to protect your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
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
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default AccountSetup;
