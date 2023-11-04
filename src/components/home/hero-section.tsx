import FacebookLogo from 'public/icons/fb-logo.svg';
import InstagramLogo from 'public/icons/ig-logo.svg';
import heroBackgroundImage from 'public/images/hero-bg.png';
import { bebasNeue } from 'src/utils/fonts';

import Image from 'next/image';
import { twJoin } from 'tailwind-merge';

const HeroSection = () => (
  <div className="relative flex h-[850px] flex-col justify-between">
    <Image
      alt="background"
      src={heroBackgroundImage}
      className="absolute z-0 h-full w-full object-cover"
      quality={100}
      placeholder="blur"
    />
    <div
      className={twJoin(
        bebasNeue.className,
        'z-10 text-[200px] leading-[260px] text-white [text-shadow:_0px_4px_4px_rgba(0,0,0,0.25)]',
        'px-40 pt-[210px] text-center'
      )}
    >
      SERVING YOU SOON..
    </div>
    <div className="z-10 grid h-[120px] grid-cols-2 bg-black/20">
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noreferrer"
        className={twJoin(
          'flex items-center justify-center gap-5 text-[26px] font-bold tracking-[3.12px] text-white',
          'cursor-pointer transition-all duration-300 ease-in-out hover:bg-black/30'
        )}
      >
        <FacebookLogo className="h-[30px] w-[30px]" />
        FOLLOW US ON FACEBOOK
      </a>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noreferrer"
        className={twJoin(
          'flex items-center justify-center gap-5 text-[26px] font-bold tracking-[3.12px] text-white',
          'cursor-pointer transition-all duration-300 ease-in-out hover:bg-black/30'
        )}
      >
        <InstagramLogo className="h-[30px] w-[30px]" />
        FOLLOW US ON INSTAGRAM
      </a>
    </div>
  </div>
);

export default HeroSection;
