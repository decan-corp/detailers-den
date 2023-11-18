import ProtectedRoute from 'src/components/auth/protected-route';

import Header from './components/header';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Header />
    {children}
  </ProtectedRoute>
);

export default AdminLayout;
