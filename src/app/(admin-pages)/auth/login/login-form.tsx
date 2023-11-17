'use client';

import { AdminRoute } from 'src/constants/routes';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ComponentProps, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const onSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
    event.preventDefault(); // always add prevent default for onSubmit action

    const formData = new FormData(event.currentTarget);

    const email = formData.get('email');
    const password = formData.get('password');

    const results = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!results?.ok && results?.error) {
      setError(results.error);
    }
    if (results?.ok) {
      router.replace(AdminRoute.Dashboard);
    }
  };
  return (
    <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
      <form method="post" className="card-body" onSubmit={onSubmit}>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="email"
            className="input input-bordered"
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="password"
            className="input input-bordered"
            required
          />
          {/* <label className="label"> */}
          {/*   <a href="#" className="link-hover link label-text-alt"> */}
          {/*     Forgot password? */}
          {/*   </a> */}
          {/* </label> */}
          <label className="label">
            <span
              className={twMerge(
                'label-text h-1 text-red-500 transition-all duration-200 ease-in-out',
                error ? 'opacity-100' : 'opacity-0'
              )}
            >
              {error}
            </span>
          </label>
        </div>
        <div className="form-control mt-6">
          <button type="submit" className="btn btn-neutral">
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
