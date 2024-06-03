import { ModeOfPayment, TransactionStatus, VehicleSize } from 'src/constants/common';
import { transactionsTable } from 'src/schema';

import {
  BikeIcon,
  BirdIcon,
  BusFrontIcon,
  BusIcon,
  CarFrontIcon,
  CarIcon,
  CoinsIcon,
  CreditCardIcon,
  TruckIcon,
  Wallet2Icon,
} from 'lucide-react';

export const transactionStatusOptions = [
  {
    value: TransactionStatus.Pending,
    label: 'Pending',
  },
  {
    value: TransactionStatus.Paid,
    label: 'Paid',
  },
  {
    value: TransactionStatus.Void,
    label: 'Void',
  },
] satisfies {
  value: (typeof transactionsTable.$inferSelect)['status'];
  label: string;
  icon?: unknown;
}[];

export const vehicleSizeOptions = [
  {
    value: VehicleSize.Motorcycle,
    label: 'Motorcycle',
    icon: BikeIcon,
  },
  {
    value: VehicleSize.Small,
    label: 'Small',
    icon: CarFrontIcon,
  },
  {
    value: VehicleSize.Medium,
    label: 'Medium',
    icon: CarIcon,
  },
  {
    value: VehicleSize.Large,
    label: 'Large',
    icon: BusFrontIcon,
  },
  {
    value: VehicleSize.ExtraLarge,
    label: 'Extra Large',
    icon: BusIcon,
  },
  {
    value: VehicleSize.ExtraExtraLarge,
    label: 'Extra Extra Large',
    icon: TruckIcon,
  },
] satisfies {
  value: (typeof transactionsTable.$inferSelect)['vehicleSize'];
  label: string;
  icon?: unknown;
}[];

export const modeOfPaymentOptions = [
  {
    value: ModeOfPayment.Cash,
    label: 'Cash',
    icon: CoinsIcon,
  },
  {
    value: ModeOfPayment.GCash,
    label: 'GCash',
    icon: Wallet2Icon,
  },
  {
    value: ModeOfPayment.BankTransfer,
    label: 'BankTransfer',
    icon: CreditCardIcon,
  },
  {
    value: ModeOfPayment.Maya,
    label: 'Maya',
    icon: BirdIcon,
  },
] satisfies {
  value: (typeof transactionsTable.$inferSelect)['modeOfPayment'];
  label: string;
  icon?: unknown;
}[];
