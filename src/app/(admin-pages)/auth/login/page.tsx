import AppLogo from 'public/images/app-logo.svg';

import LoginForm from './login-form';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

const Login = () => (
  <main className="hero min-h-screen bg-base-200">
    <div className="hero-content flex-col-reverse gap-6 lg:flex-row-reverse">
      <LoginForm />
      <div className="flex max-w-xl flex-col items-center text-center lg:items-end lg:text-right">
        <AppLogo className="w-52" />
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
