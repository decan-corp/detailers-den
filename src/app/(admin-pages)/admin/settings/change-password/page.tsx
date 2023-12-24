import { Separator } from '@/components/ui/separator';

import ChangePasswordForm from './components/change-password-form';

const ChangePasswordPage = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium">Change Password</h3>
      <p className="text-sm text-muted-foreground">Update your account password here.</p>
    </div>
    <Separator />
    <ChangePasswordForm />
  </div>
);

export default ChangePasswordPage;
