export enum Role {
  StayInCrew = 'stay-in-crew',
  Crew = 'crew',
  Cashier = 'cashier',
  Accountant = 'accountant',
  Detailer = 'detailer',
  Admin = 'admin',
}

export type CrewRole = Role.Crew | Role.StayInCrew | Role.Detailer;

export enum TransactionStatus {
  Pending = 'pending',
  Paid = 'paid',
  Void = 'void',
}

export enum VehicleSize {
  Motorcycle = 'mc',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  ExtraLarge = 'x-large',
  ExtraExtraLarge = 'xxl',
}

export enum ModeOfPayment {
  Cash = 'cash',
  GCash = 'gcash',
  Maya = 'maya',
  BankTransfer = 'bank-transfer',
}
