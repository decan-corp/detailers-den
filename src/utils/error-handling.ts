import { SafeAction } from 'next-safe-action/.';
import { toast } from 'sonner';
import { z } from 'zod';

export const handleSafeActionError = (
  params: Awaited<ReturnType<SafeAction<z.ZodTypeAny, unknown>>>
) => {
  if (params.validationError) {
    toast.error('Invalid Input', {
      description:
        'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
    });

    return;
  }

  if (params?.serverError) {
    toast.error('Something went wrong', {
      description: params.serverError,
    });
  }
};
