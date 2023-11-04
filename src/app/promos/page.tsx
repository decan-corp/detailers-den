import { bebasNeue } from 'src/utils/fonts';

import { twJoin } from 'tailwind-merge';

const Promos = () => (
  <div className="flex h-screen items-start justify-center px-10">
    <div
      className={twJoin(
        bebasNeue.className,
        'mt-60 text-center text-3xl leading-loose tracking-widest'
      )}
    >
      Exciting Content in Progress - Check Back Soon!
    </div>
  </div>
);

export default Promos;
