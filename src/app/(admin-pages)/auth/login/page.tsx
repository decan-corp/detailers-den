import LoginForm from './components/login-form';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

const Login = () => (
  <main className="grid min-h-screen lg:grid-cols-2">
    <div className="hidden flex-col justify-between bg-muted p-10 lg:flex">
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
        {/* <div className="mt-4 text-center"> */}
        {/*   <Link */}
        {/*     className="text-sm text-muted-foreground underline hover:brightness-125" */}
        {/*     href={AdminRoute.ForgotPassword} */}
        {/*   > */}
        {/*     Forgot Password */}
        {/*   </Link> */}
        {/* </div> */}
      </div>
    </div>
  </main>
);

export default Login;
