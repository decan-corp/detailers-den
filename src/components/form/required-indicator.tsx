import { DotFilledIcon } from '@radix-ui/react-icons';

const RequiredIndicator = () => (
  <div className="relative mr-1">
    <DotFilledIcon className="absolute top-[-4px] text-destructive dark:text-destructive-200" />
  </div>
);

export const RequiredIndicatorIcon = () => (
  <DotFilledIcon className="absolute right-[-14px] top-[-3px] text-destructive dark:text-destructive-200" />
);

export default RequiredIndicator;
