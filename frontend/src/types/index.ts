// Local type definitions for types that need conversion from backend types
import type { PaymentMethod as BackendPaymentMethod, PaymentCategory as BackendPaymentCategory, PaymentSubCategory as BackendPaymentSubCategory } from '../backend';

// Re-export backend enums
export { PaymentCategory, PaymentSubCategory } from '../backend';

// Transaction with userId converted to string
export interface Transaction {
  id: bigint;
  userId: string;
  outletId: bigint;
  items: TransactionItem[];
  total: bigint;
  timestamp: bigint;
  paymentMethods: PaymentMethod[];
}

// TransactionItem from backend
export interface TransactionItem {
  productId: bigint;
  quantity: bigint;
  price: bigint;
  isPackage: boolean;
  isBundle: boolean;
}

// PaymentMethod from backend
export interface PaymentMethod {
  category: BackendPaymentCategory;
  subCategory?: BackendPaymentSubCategory;
  methodName: string;
  amount: bigint;
}

export interface Outlet {
  id: bigint;
  name: string;
  address: string;
  createdAt: bigint;
  isActive: boolean;
}

export interface StockLog {
  id: bigint;
  productId: bigint;
  outletId: bigint;
  operation: string;
  quantity: bigint;
  fromOutletId?: bigint;
  toOutletId?: bigint;
  userId: string;
  timestamp: bigint;
}

export interface DailySummary {
  totalRevenue: bigint;
  transactionCount: bigint;
  date: bigint;
}

