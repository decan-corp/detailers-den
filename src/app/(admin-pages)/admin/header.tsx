import { authOptions } from 'src/app/api/auth/[...nextauth]/route';
import LogoutButton from 'src/components/button/logout';
import { AdminRoute } from 'src/constants/routes';
import { inter } from 'src/utils/fonts';

import HeaderLink from './header-link';

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { twJoin } from 'tailwind-merge';

const Header = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div className="navbar bg-base-100 px-10 shadow-md shadow-black/10">
      <div className="flex-1">
        <Link href={AdminRoute.Dashboard} className="btn btn-ghost text-xl">
          185 Detailers Den
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal gap-3 px-1">
          <li>
            <HeaderLink route={AdminRoute.Dashboard}>Dashboard</HeaderLink>
          </li>
          <li>
            <HeaderLink className="pointer-events-none" route={AdminRoute.POS}>
              POS
            </HeaderLink>
          </li>
          <li>
            <details>
              <summary>Account</summary>
              <ul className="right-0 min-w-[208px] bg-base-100 p-2">
                <div className="px-4 py-2">
                  <div className={twJoin(inter.className, 'font-semibold')}>
                    {session?.user.name}
                  </div>
                  <div className="text-black/40">{session?.user.email}</div>
                  <div className="text-black/40">{session?.user.role}</div>
                </div>
                <div className="my-2 border-b border-black/10" />
                <li>
                  <HeaderLink className="pointer-events-none" route={AdminRoute.Settings}>
                    Settings
                  </HeaderLink>
                </li>
                <li>
                  <LogoutButton />
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;
