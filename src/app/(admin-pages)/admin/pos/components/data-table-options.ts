import { ModeOfPayment, TransactionStatus, VehicleSize } from 'src/constants/common';
import { transactions } from 'src/schema';

import {
  BikeIcon,
  BirdIcon,
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
  value: (typeof transactions.$inferSelect)['status'];
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
    icon: BusIcon,
  },
  {
    value: VehicleSize.ExtraLarge,
    label: 'Extra Large',
    icon: TruckIcon,
  },
] satisfies {
  value: (typeof transactions.$inferSelect)['vehicleSize'];
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
  value: (typeof transactions.$inferSelect)['modeOfPayment'];
  label: string;
  icon?: unknown;
}[];
