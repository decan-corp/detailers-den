import { bebasNeue } from 'src/utils/fonts';

import { twJoin } from 'tailwind-merge';

const Pricing = () => (
  <div className="flex h-screen items-start justify-center">
    <div className={twJoin(bebasNeue.className, 'mt-60 text-3xl tracking-widest')}>
      Exciting Content in Progress - Check Back Soon!
    </div>
  </div>
);

export default Pricing;
