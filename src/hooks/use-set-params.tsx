import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const useSetParams = <T extends string = string>() => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParams = (key: T, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);

    params.toString();
    router.push(`${pathname}?${params.toString()}`);
  };

  return setParams;
};

export default useSetParams;
