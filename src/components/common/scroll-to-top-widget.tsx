'use client';

import { cabin } from 'src/utils/fonts';

import { throttle } from 'lodash';
import { useEffect, useState } from 'react';
import { twJoin } from 'tailwind-merge';

const ScrollToTopWidget = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (window.scrollY > 100) {
        // Adjust this threshold as needed
        setShow(true);
      } else {
        setShow(false);
      }
    }, 300);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const onClickScrollToTop = () => {
    window.scroll({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      className={twJoin(
        cabin.className,
        'fixed bottom-7 right-5 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#D9D9D9]',
        'outline-none',
        'transition-all duration-300 ease-in-out',
        // 'transition-all duration-1000 ease-in-out hover:scale-105 hover:brightness-110',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      )}
      onClick={onClickScrollToTop}
    >
      <span className={twJoin(cabin.className, 'mt-6 text-[54px] leading-normal text-black/50')}>
        ^
      </span>
    </button>
  );
};

export default ScrollToTopWidget;
