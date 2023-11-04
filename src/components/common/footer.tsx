// spell-checker:disable
import { notoSans } from 'src/utils/fonts';

import dayjs from 'dayjs';
import { twJoin } from 'tailwind-merge';

const Footer = () => (
  <div className="flex h-[180px] flex-col-reverse justify-between bg-black px-[50px] pt-[21px] md:flex-row md:gap-3 md:px-16 lg:px-40">
    <div className="md:w-[360px]">
      <div
        className={twJoin(
          notoSans.className,
          'flex h-[53px] items-center justify-center text-xs font-normal tracking-[0.72px] text-white md:text-[15px] md:tracking-[0.45px]'
        )}
      >
        All Rights Reserved . © 185 Detailers Den | {dayjs().format('YYYY')}
      </div>
      <div
        className={twJoin(
          notoSans.className,
          'mt-[11px] hidden h-[53px] items-center justify-center text-sm font-normal tracking-[0.84px] text-white md:flex'
        )}
      >
        L1 B4 Malanting, Amparo Subd., Brgy. 179 Tala, North Caloocan City, Metro Manila, 1425
      </div>
    </div>
    <div />

    <div className="flex w-full justify-between text-white md:h-[127px] md:w-[265px] md:flex-col">
      <div className="flex flex-col gap-2">
        <div
          className={twJoin(
            notoSans.className,
            'cursor-pointer text-sm tracking-[0.84px] md:text-[15px] md:tracking-[0.9px]'
          )}
        >
          Join our Team
        </div>
        <div
          className={twJoin(
            notoSans.className,
            'cursor-pointer text-sm tracking-[0.84px] md:text-[15px] md:tracking-[0.9px]'
          )}
        >
          Support
        </div>
        <div
          className={twJoin(
            notoSans.className,
            'cursor-pointer text-sm tracking-[0.84px] md:text-[15px] md:tracking-[0.9px]'
          )}
        >
          Terms and Conditions
        </div>
      </div>
      <div className="flex flex-col gap-2 md:mt-2">
        <div
          className={twJoin(
            notoSans.className,
            'cursor-pointer text-sm tracking-[0.84px] md:text-[15px] md:tracking-[0.9px]'
          )}
        >
          Policy
        </div>
        <div
          className={twJoin(
            notoSans.className,
            'cursor-pointer text-sm tracking-[0.84px] md:text-[15px] md:tracking-[0.9px]'
          )}
        >
          Contact Us
        </div>
      </div>
    </div>
  </div>
);

export default Footer;
