'use client';

import HeartIcon from 'public/icons/heart.svg';
import ManIcon from 'public/icons/man.svg';
import AppLogo from 'public/images/app-logo.svg';
import { Route } from 'src/constants/routes';
import { notoSans } from 'src/utils/fonts';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twJoin } from 'tailwind-merge';

const NavMenu = ({
  label,
  route,
  isActive,
}: {
  label: string;
  route: Route;
  isActive: boolean;
}) => (
  <Link
    className={twJoin(
      notoSans.className,
      'w-[75px] text-center text-sm duration-200 ease-in-out hover:scale-110 hover:transition-all',
      isActive && 'font-bold'
    )}
    href={route}
  >
    {label}
  </Link>
);

const Header = () => {
  const pathname = usePathname() as Route;

  return (
    // <div className="sticky top-0 z-20 flex h-[120px] justify-end bg-black"> // TODO: make header sticky but currently it has issues due to the app logo
    <div className="relative flex h-[120px] justify-end bg-black">
      <Link href={Route.Home}>
        <AppLogo className="absolute left-[123px] top-[13px] z-20 h-[322px] w-[322px]" />
      </Link>
      <div className="mr-[68px] mt-[70px] flex justify-between gap-[119px] text-white">
        <div className="flex flex-row gap-5">
          <NavMenu label="PRICING" route={Route.Pricing} isActive={pathname === Route.Pricing} />
          <NavMenu label="SERVICES" route={Route.Services} isActive={pathname === Route.Services} />
          <NavMenu label="PROMOS" route={Route.Promos} isActive={pathname === Route.Promos} />
          <NavMenu label="FAQ" route={Route.Faq} isActive={pathname === Route.Faq} />
          <NavMenu label="ABOUT US" route={Route.AboutUs} isActive={pathname === Route.AboutUs} />
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
