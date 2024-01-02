import ProtectedRoute from 'src/components/auth/protected-route';

import Header from './components/header';

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Header />
    {children}
  </ProtectedRoute>
);

export default AdminLayout;
