'use client';

import { TypeAnimation } from 'react-type-animation';

const Home = () => (
  <main className="z-0 flex min-h-screen flex-col items-center justify-center px-2 py-24">
    <div className="relative z-0 flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]" />
    <TypeAnimation
      sequence={['185 Detailers Den\nOpening Soon', 1500, '185 Detailers Den\nStay Tuned!', 2000]}
      repeat={Infinity}
      speed={30}
      className="relative z-10 block h-56 whitespace-pre-line text-center font-mono text-2xl font-semibold leading-[4rem] sm:text-3xl md:text-4xl md:leading-[5.25rem]"
    />
  </main>
);

export default Home;
