import { DotFilledIcon } from '@radix-ui/react-icons';

const RequiredIndicator = () => (
  <div className="relative mr-1">
    <DotFilledIcon className="absolute top-[-4px] text-destructive dark:text-destructive-200" />
  </div>
);

export default RequiredIndicator;
