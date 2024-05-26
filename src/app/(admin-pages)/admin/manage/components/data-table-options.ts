import { Role } from 'src/constants/common';
import { UserSelect } from 'src/types/schema';

import { BackpackIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { BrushIcon, HardHatIcon, PiggyBankIcon } from 'lucide-react';

export const roleOptions = [
  {
    value: Role.Crew,
    label: 'Crew',
    icon: SunIcon,
  },
  {
    value: Role.StayInCrew,
    label: 'Stay-in-crew',
    icon: MoonIcon,
  },
  {
    value: Role.Cashier,
    label: 'Cashier',
    icon: PiggyBankIcon,
  },
  {
    value: Role.Detailer,
    label: 'Detailer',
    icon: BrushIcon,
  },
  {
    value: Role.Accountant,
    label: 'Accounting',
    icon: BackpackIcon,
  },
  {
    value: Role.Admin,
    label: 'Admin',
    icon: HardHatIcon,
  },
] satisfies { value: UserSelect['role']; label: string; icon: unknown }[];
