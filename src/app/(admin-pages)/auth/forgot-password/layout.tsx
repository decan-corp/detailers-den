import PublicRoute from 'src/components/auth/public-route';

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <PublicRoute>{children}</PublicRoute>
);

export default AuthLayout;
