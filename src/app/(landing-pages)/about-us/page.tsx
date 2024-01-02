import { bebasNeue } from 'src/utils/fonts';

import { Metadata } from 'next';
import { twJoin } from 'tailwind-merge';

export const metadata: Metadata = {
  title: 'About',
};

const AboutUs = () => (
  <main className="flex h-screen items-start justify-center bg-white px-10">
    <div
      className={twJoin(
        bebasNeue.className,
        'mt-60 text-center text-3xl leading-loose tracking-widest'
      )}
    >
      Exciting Content in Progress - Check Back Soon!
    </div>
  </main>
);

export default AboutUs;
