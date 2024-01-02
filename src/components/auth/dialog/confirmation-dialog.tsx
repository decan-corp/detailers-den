import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export const ConfirmDialog = ({
  title,
  description,
  buttonLabel,
  onClickCancel,
  onClickConfirm,
  hideButtonTrigger = false,
  isOpen,
  onOpenChange,
  disableConfirm,
  disableCancel,
}: {
  title: string;
  description: string;
  buttonLabel?: string;
  onClickCancel?: () => void;
  onClickConfirm: () => void;
  hideButtonTrigger?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disableConfirm?: boolean;
  disableCancel?: boolean;
}) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    {!hideButtonTrigger && (
      <AlertDialogTrigger asChild>
        <Button variant="outline">{buttonLabel}</Button>
      </AlertDialogTrigger>
    )}
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClickCancel} disabled={disableCancel}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction onClick={onClickConfirm} disabled={disableConfirm}>
          Continue
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
