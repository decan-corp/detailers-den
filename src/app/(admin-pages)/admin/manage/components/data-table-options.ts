import { UserSelect } from 'src/types/schema';

import {
  CheckCircledIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons';
import { CircleIcon } from 'lucide-react';

// TODO: change icons
export const roles = [
  {
    value: 'crew',
    label: 'Crew',
    icon: QuestionMarkCircledIcon,
  },
  {
    value: 'admin',
    label: 'Admin',
    icon: CircleIcon,
  },
  {
    value: 'cashier',
    label: 'Cashier',
    icon: StopwatchIcon,
  },
  {
    value: 'detailer',
    label: 'Detailer',
    icon: CheckCircledIcon,
  },
  {
    value: 'accounting',
    label: 'Accounting',
    icon: CrossCircledIcon,
  },
  {
    value: 'stay-in-crew',
    label: 'Stay-in-crew',
    icon: CrossCircledIcon,
  },
] satisfies { value: UserSelect['role']; label: string; icon: unknown }[];
