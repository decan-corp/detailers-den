// spell-checker:disable
import { notoSans } from 'src/utils/fonts';

import dayjs from 'dayjs';
import { twJoin } from 'tailwind-merge';

const Footer = () => (
  <div className="flex h-[180px] justify-between bg-black px-40 pt-[21px]">
    <div className="w-[360px]">
      <div
        className={twJoin(
          notoSans.className,
          'flex h-[53px] items-center justify-center text-[15px] font-normal tracking-[0.45px] text-white'
        )}
      >
        All Rights Reserved . © 185 Detailers Den | {dayjs().format('YYYY')}
      </div>
      <div
        className={twJoin(
          notoSans.className,
          'mt-[11px] flex h-[53px] items-center justify-center text-sm font-normal tracking-[0.84px] text-white'
        )}
      >
        L1 B4 Malanting, Amparo Subd., Brgy. 179 Tala, North Caloocan City, Metro Manila, 1425
      </div>
    </div>
    <div />

    <div className="flex h-[127px] w-[265px] flex-col justify-between text-white">
      <div className={twJoin(notoSans.className, 'cursor-pointer text-[15px] tracking-[0.9px]')}>
        Join our Team
      </div>
      <div className={twJoin(notoSans.className, 'cursor-pointer text-[15px] tracking-[0.9px]')}>
        Support
      </div>
      <div className={twJoin(notoSans.className, 'cursor-pointer text-[15px] tracking-[0.9px]')}>
        Terms and Conditions
      </div>
      <div className={twJoin(notoSans.className, 'cursor-pointer text-[15px] tracking-[0.9px]')}>
        Policy
      </div>
      <div className={twJoin(notoSans.className, 'cursor-pointer text-[15px] tracking-[0.9px]')}>
        Contact Us
      </div>
    </div>
  </div>
);

export default Footer;
