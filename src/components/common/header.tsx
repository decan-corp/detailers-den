/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

'use client';

import ArrowLeftIcon from 'public/icons/arrow-left.svg';
import BurgerIcon from 'public/icons/burger.svg';
import HeartIcon from 'public/icons/heart.svg';
import ManIcon from 'public/icons/man.svg';
import AppLogo from 'public/images/app-logo.svg';
import { Route } from 'src/constants/routes';
import { notoSans } from 'src/utils/fonts';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const NavMenuItem = ({
  label,
  route,
  isActive,
}: {
  label: string;
  route: Route;
  isActive: boolean;
}) => (
  <Link
    className={twMerge(
      notoSans.className,
      'w-[75px] text-center text-sm duration-200 ease-in-out hover:scale-110 hover:font-bold hover:transition-all',
      isActive && 'font-bold'
    )}
    href={route}
  >
    {label}
  </Link>
);

const MobileNavMenuItem = ({
  label,
  route,
  isActive,
}: {
  label: string;
  route: Route;
  isActive: boolean;
}) => (
  <Link
    className={twMerge(
      notoSans.className,
      'py-6 text-center text-2xl font-normal text-white',
      isActive && 'font-bold text-yellow-400'
    )}
    href={route}
  >
    {label}
  </Link>
);

const Header = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const pathname = usePathname() as Route;

  const toggleDrawer = useCallback(() => {
    setShowDrawer((prevState) => !prevState);
  }, []);

  return (
    <div className="sticky top-0 z-20 flex h-[90px] bg-black/70 backdrop-blur lg:h-[120px] lg:justify-end">
      <Link href={Route.Home}>
        <AppLogo className="absolute right-[35px] z-20 h-[235px] w-[235px] lg:left-[123px] lg:top-[13px] lg:h-[322px] lg:w-[322px]" />
      </Link>
      {/* Mobile Menu */}
      <div className="drawer z-50 px-[30px] pt-[30px] lg:hidden">
        <input
          id="menu-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={showDrawer}
          readOnly
        />
        <div className="drawer-content">
          {/* Toggle button here */}
          <label htmlFor="menu-drawer">
            <BurgerIcon className="h-[15px] w-5 cursor-pointer" onClick={toggleDrawer} />
          </label>
        </div>
        <div className="drawer-side" onClick={toggleDrawer}>
          <label htmlFor="menu-drawer" aria-label="close sidebar" className="drawer-overlay" />
          <div className="menu min-h-full w-80 bg-black/40 p-0 text-base-content backdrop-blur-md">
            {/* Sidebar content here */}
            <div className="p-8">
              <ArrowLeftIcon className="h-6 w-6 cursor-pointer" />
            </div>
            <div className="flex flex-col gap-4">
              <MobileNavMenuItem
                label="HOME"
                route={Route.Home}
                isActive={pathname === Route.Home}
              />
              <MobileNavMenuItem
                label="PRICING"
                route={Route.Pricing}
                isActive={pathname === Route.Pricing}
              />
              <MobileNavMenuItem
                label="SERVICES"
                route={Route.Services}
                isActive={pathname === Route.Services}
              />
              <MobileNavMenuItem
                label="PROMOS"
                route={Route.Promos}
                isActive={pathname === Route.Promos}
              />
              <MobileNavMenuItem label="FAQ" route={Route.Faq} isActive={pathname === Route.Faq} />
              <MobileNavMenuItem
                label="ABOUT US"
                route={Route.AboutUs}
                isActive={pathname === Route.AboutUs}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Desktop Menu */}
      <div className="mr-[68px] mt-[70px] hidden justify-between gap-[119px] text-white lg:flex">
        <div className="flex flex-row gap-5">
          <NavMenuItem
            label="PRICING"
            route={Route.Pricing}
            isActive={pathname === Route.Pricing}
          />
          <NavMenuItem
            label="SERVICES"
            route={Route.Services}
            isActive={pathname === Route.Services}
          />
          <NavMenuItem label="PROMOS" route={Route.Promos} isActive={pathname === Route.Promos} />
          <NavMenuItem label="FAQ" route={Route.Faq} isActive={pathname === Route.Faq} />
          <NavMenuItem
            label="ABOUT US"
            route={Route.AboutUs}
            isActive={pathname === Route.AboutUs}
          />
        </div>

        <div className="flex justify-between gap-[30px]">
          <HeartIcon className="h-5 w-5" />
          <ManIcon className="h-[18px] w-[18px]" />
        </div>
      </div>
    </div>
  );
};

export default Header;
