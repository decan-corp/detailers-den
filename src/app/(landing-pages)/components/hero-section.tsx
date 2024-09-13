// spell-checker:disable
import FacebookLogo from 'public/icons/fb-logo.svg';
import InstagramLogo from 'public/icons/ig-logo.svg';
import heroBackgroundImageMobile1 from 'public/images/hero-bg-mobile-1.png';
import heroBackgroundImageMobile2 from 'public/images/hero-bg-mobile-2.png';
import heroBackgroundImage from 'public/images/hero-bg.png';
import { bebasNeue, cabin, inter } from 'src/utils/fonts';

import Image from 'next/image';
import { twJoin } from 'tailwind-merge';

const HeroSection = () => (
  <div>
    <div className="relative flex flex-col items-center justify-between pb-10 md:h-[1200px] md:pb-0 lg:h-[950px]">
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
          'z-10 mx-6 mt-[100px] md:mx-16 md:mt-[150px] lg:mx-32 lg:mt-[210px]',
          'grid max-w-[1240px] grid-cols-1 justify-center gap-x-16 gap-y-10 lg:grid-cols-5'
        )}
      >
        <div className="w-full space-y-8 bg-[#bcbcbc] p-6 px-8 lg:col-span-2">
          <div className="space-y-5">
            <div className={twJoin(inter.className, 'text-2xl font-semibold')}>
              Location:
              <div className="w-40 border-2 border-b border-yellow-400" />
            </div>
            <div className={twJoin(inter.className, 'text-base font-medium leading-tight')}>
              L1 B4 Malanting, Amparo Subd., Brgy. 179 Tala, North Caloocan City, Metro Manila, 1425
            </div>
          </div>
          <div className="space-y-5">
            <div className={twJoin(inter.className, 'text-2xl font-semibold')}>
              About Us: <div className="w-40 border-2 border-b border-yellow-400" />
            </div>
            <div className={twJoin(inter.className, 'text-base font-medium leading-tight')}>
              Welcome to 185 Detailers Den, your destination for excellence in car care, right here
              in Caloocan. Our passionate team is dedicated to delivering top-notch car detailing
              and washing services. With advanced techniques and an eco-friendly approach, we bring
              out the best in your vehicle, ensuring a spotless shine and a lasting impact. Trust
              185 Detailers Den for a superior automotive experience that goes beyond the ordinary.
            </div>
          </div>
        </div>
        <div className="h-[460px] md:h-[480px] lg:col-span-3 lg:h-[520px]">
          <iframe
            className="h-full w-full border-none"
            title="google-maps"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1226.5106029097797!2d121.08103604546301!3d14.750045746081373!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397bb32b9d85051%3A0xe18afe86561c85cf!2s185%20Detailers%20Den!5e0!3m2!1sen!2sph!4v1704187543063!5m2!1sen!2sph"
            width="600"
            height="450"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Desktop View for Social Links */}
      <div className="z-10 hidden h-[120px] w-full grid-cols-2 bg-black/20 md:grid">
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
            'text-center text-[26px] font-bold tracking-[3.12px] text-white'
          )}
        >
          <FacebookLogo className="h-[50px] w-[50px]" />
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
          <InstagramLogo className="h-[50px] w-[50px]" />
          FOLLOW US ON INSTAGRAM
        </a>
      </div>
    </div>
  </div>
);

export default HeroSection;
