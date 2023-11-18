import LoginForm from './login-form';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

// const Login = () => (
//   <main className="hero min-h-screen bg-base-200">
//     <div className="hero-content flex-col-reverse gap-6 lg:flex-row-reverse">
//       <LoginForm />
//       <div className="flex max-w-xl flex-col items-center text-center lg:items-end lg:text-right">
//         <AppLogo className="w-52" />
//         <p className="py-6">Welcome to 185 Detailers Den Admin Portal</p>
//         <p className="hidden lg:block">
//           Login using the provided credentials to manage and oversee administrative tasks with
//           efficiency.
//         </p>
//       </div>
//     </div>
//   </main>
// );

const Login = () => (
  <main className="grid min-h-screen lg:grid-cols-2">
    <div className="hidden flex-col justify-between bg-muted p-10 text-white lg:flex">
      <div className="text-lg">185 Detailers Den</div>
      <div className="text-lg">
        185 Detailers Den is a car detailing and car wash business located in Caloocan City,
        Philippines.
      </div>
    </div>

    <div className="flex items-center justify-center">
      <div className="w-[320px] text-center">
        <div className="text-2xl font-semibold tracking-tight">Login with your account</div>
        <div className="mt-2 text-sm text-muted-foreground">
          Enter your credentials below to login
        </div>
        <LoginForm />
      </div>
    </div>
  </main>
);

export default Login;
