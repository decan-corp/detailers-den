import UserGroupIcon from 'public/icons/user-group.svg';
import { AdminRoute } from 'src/constants/routes';

import Link from 'next/link';

const Home = () => (
  <main className="flex h-[calc(100%-68px)] flex-row gap-10 px-10 py-10">
    <div className="h-full border-r border-black/10">
      <ul className="menu rounded-box w-56 bg-base-100">
        <li>
          <Link href={AdminRoute.Users}>
            <UserGroupIcon className="w-4" />
            Users
          </Link>
        </li>
      </ul>
    </div>
    <div>test</div>
  </main>
);

export default Home;
