import { authOptions } from 'src/app/api/auth/[...nextauth]/route';

import { getServerSession } from 'next-auth';

const Home = async () => {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex flex-col bg-white">
      <div>Admin page</div>
      <div>Welcome - {session?.user?.name}</div>
      <div>role: {session?.user?.role}</div>
    </main>
  );
};

export default Home;
