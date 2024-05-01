'use client';

import useClientSession from 'src/hooks/use-client-session';

import { ProfileForm } from './profile-form';

export const Profile = () => {
  const { data: account, isLoading } = useClientSession();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="loading loading-ring loading-lg text-foreground" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-foreground">No account found</span>
      </div>
    );
  }

  return <ProfileForm profile={account} />;
};
