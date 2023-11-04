import heroBackgroundImageMobile1 from 'public/images/hero-bg-mobile-1.png';
import heroBackgroundImageMobile2 from 'public/images/hero-bg-mobile-2.png';
import heroBackgroundImage from 'public/images/hero-bg.png';
import FacebookLogo from 'src/assets/icons/fb-logo';
import InstagramLogo from 'src/assets/icons/ig-logo';
import { bebasNeue, cabin } from 'src/utils/fonts';

import Image from 'next/image';
import { twJoin } from 'tailwind-merge';

const HeroSection = () => (
  <div>
    <div className="relative flex h-[540px] flex-col justify-between md:h-[850px]">
      <Image
        alt="background"
        src={heroBackgroundImage}
        className="absolute z-0 hidden h-full w-full object-cover md:block"
        quality={100}
        placeholder="blur"
      />
      <Image
        alt="background"
        src={heroBackgroundImageMobile1}
        className="absolute z-0 h-full w-full object-cover md:hidden"
        quality={100}
        placeholder="blur"
      />
      <div
        className={twJoin(
          bebasNeue.className,
          'z-10 text-[90px] leading-[115px] tracking-[1.8px] text-white [text-shadow:_0px_4px_4px_rgba(0,0,0,0.25)] md:text-9xl md:leading-[180px] lg:text-[200px] lg:leading-[260px] lg:tracking-[4px]',
          'mt-[150px] flex px-40 text-center md:mt-[210px]'
        )}
      >
        SERVING YOU SOON..
      </div>

      {/* Desktop View for Social Links */}
      <div className="z-10 hidden h-[120px] grid-cols-2 bg-black/20 md:grid">
        <a
          href="https://www.facebook.com/185dd"
          target="_blank"
          rel="noreferrer"
          className={twJoin(
            cabin.className,
            'flex items-center justify-center gap-5 text-[26px] font-bold tracking-[3.12px] text-white',
            'cursor-pointer transition-all duration-300 ease-in-out hover:bg-black/30'
          )}
        >
          <FacebookLogo className="h-[30px] w-[30px]" />
          FOLLOW US ON FACEBOOK
        </a>
        <a
          href="https://www.instagram.com/detailersdenph"
          target="_blank"
          rel="noreferrer"
          className={twJoin(
            cabin.className,
            'flex items-center justify-center gap-5 text-[26px] font-bold tracking-[3.12px] text-white',
            'cursor-pointer transition-all duration-300 ease-in-out hover:bg-black/30'
          )}
        >
          <InstagramLogo className="h-[30px] w-[30px]" />
          FOLLOW US ON INSTAGRAM
        </a>
      </div>
    </div>

    {/* Mobile View for Social Links */}
    <div className="relative mb-[30px] mt-[30px] grid h-[430px] grid-rows-2 md:hidden">
      <Image
        alt="background"
        src={heroBackgroundImageMobile2}
        className="absolute z-0 h-full w-full object-cover md:hidden"
        quality={100}
        placeholder="blur"
      />
      <div className="z-10 flex cursor-pointer items-end justify-center pb-[15px] transition-all duration-300 ease-in-out hover:bg-black/30">
        <a
          href="https://www.facebook.com/185dd"
          target="_blank"
          rel="noreferrer"
          className={twJoin(
            cabin.className,
            'relative flex w-[293px] flex-col items-center justify-center gap-[10px]',
            ' text-center text-[26px] font-bold tracking-[3.12px] text-white'
          )}
        >
          <FacebookLogo id="facebook-logo-mobile" className="h-[50px] w-[50px]" />
          FOLLOW US ON FACEBOOK
        </a>
      </div>
      <div className="z-10 flex cursor-pointer items-start justify-center pt-[15px] transition-all duration-300 ease-in-out hover:bg-black/30">
        <a
          href="https://www.instagram.com/detailersdenph"
          target="_blank"
          rel="noreferrer"
          className={twJoin(
            'flex w-[293px] flex-col items-center justify-center gap-[10px]',
            'text-center text-[26px] font-bold tracking-[3.12px] text-white'
          )}
        >
          <InstagramLogo id="instagram-logo-mobile" className="h-[50px] w-[50px]" />
          FOLLOW US ON INSTAGRAM
        </a>
      </div>
    </div>
  </div>
);

export default HeroSection;
