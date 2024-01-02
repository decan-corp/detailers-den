import serviceImage1 from 'public/images/service-image-1.png';
import serviceImage2 from 'public/images/service-image-2.png';
import { cabin } from 'src/utils/fonts';

import Image from 'next/image';
import { twJoin } from 'tailwind-merge';

const ServiceSection = () => (
  <div className="relative hidden flex-col items-center pb-[60px] pt-[30px] md:flex">
    <div className="flex">
      <Image src={serviceImage1} alt="service-image-1" placeholder="blur" />
      <div className="flex w-[560px] flex-col items-center justify-center">
        <div
          className={twJoin(
            cabin.className,
            'flex h-[60px] items-center text-4xl font-bold leading-normal tracking-[7.2px]'
          )}
        >
          RESTORATION
        </div>
        <div
          className={twJoin(
            cabin.className,
            'flex h-[30px] items-center text-base font-bold tracking-[3.2px]'
          )}
        >
          PREMIUM CAR WASH.ENGINE WASH.BUFFING
        </div>
        <button
          type="button"
          className={twJoin(
            cabin.className,
            'mt-[10px] h-[30px] bg-yellow-400 px-3 font-[15px] text-white outline-none',
            'transition-all duration-200 ease-in-out hover:brightness-105'
          )}
        >
          Learn More
        </button>
      </div>
    </div>
    <div className="flex">
      <div className="flex w-[560px] flex-col items-center justify-center">
        <div
          className={twJoin(
            cabin.className,
            'flex h-[60px] items-center text-4xl font-bold leading-normal tracking-[7.2px]'
          )}
        >
          PROTECTION
        </div>
        <div
          className={twJoin(
            cabin.className,
            'flex h-[30px] items-center text-base font-bold tracking-[3.2px]'
          )}
        >
          PAINT CORRECTION.WAXING.COATING.SANITIZING
        </div>
        <button
          type="button"
          className={twJoin(
            cabin.className,
            'mt-[10px] h-[30px] bg-yellow-400 px-3 font-[15px] text-white outline-none',
            'transition-all duration-200 ease-in-out hover:brightness-105'
          )}
        >
          Learn More
        </button>
      </div>
      <Image src={serviceImage2} alt="service-image-2" placeholder="blur" />
    </div>
  </div>
);

export default ServiceSection;
