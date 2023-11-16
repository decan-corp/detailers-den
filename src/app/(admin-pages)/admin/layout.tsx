import ProtectedRoute from 'src/components/auth/protected-route';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

export default AdminLayout;
