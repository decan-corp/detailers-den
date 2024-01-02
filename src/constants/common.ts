export enum Role {
  StayInCrew = 'stay-in-crew',
  Crew = 'crew',
  Cashier = 'cashier',
  Accounting = 'accounting',
  Detailer = 'detailer',
  Admin = 'admin',
}

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
}

export enum ModeOfPayment {
  Cash = 'cash',
  GCash = 'gcash',
  Maya = 'maya',
  BankTransfer = 'bank-transfer',
}
