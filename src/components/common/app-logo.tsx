'use client';

import AppLongLogo from 'public/images/app-logo-long.svg';
import AppLogoMobile from 'public/images/app-logo.svg';
import { Route } from 'src/constants/routes';

import { throttle } from 'lodash';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const AppLogo = () => {
  const [isWindowScrolled, setIsWindowScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (window.scrollY > 100) {
        setIsWindowScrolled(true);
      } else {
        setIsWindowScrolled(false);
      }
    }, 300);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Link href={Route.Home}>
      <AppLongLogo
        className={twMerge(
          'absolute left-[0px] top-[81px] z-20 hidden h-[182px] w-[436px] lg:block',
          'transition-all duration-700 ease-in-out',
          isWindowScrolled && 'top-[6px] opacity-30'
        )}
      />
      <AppLogoMobile
        className={twMerge(
          'absolute right-[58px] top-[60px] z-20 h-[80px] w-[132px] lg:hidden',
          'transition-all duration-700 ease-in-out',
          isWindowScrolled && 'top-[16px] opacity-30'
        )}
      />
    </Link>
  );
};

export default AppLogo;
