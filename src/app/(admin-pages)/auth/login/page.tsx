import LoginForm from './login-form';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

const Login = () => (
  <main className="hero min-h-screen bg-base-200">
    <div className="hero-content flex-col-reverse gap-6 lg:flex-row-reverse">
      <LoginForm />
      <div className="max-w-xl text-center lg:text-right">
        <h1 className="text-5xl font-bold">Login</h1>
        <p className="py-6">Welcome to 185 Detailers Den Admin Portal</p>
        <p className="hidden lg:block">
          Login using the provided credentials to manage and oversee administrative tasks with
          efficiency.
        </p>
      </div>
    </div>
  </main>
);

export default Login;
