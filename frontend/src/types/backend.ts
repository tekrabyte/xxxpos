// Local type definitions for backend types not exported in backend.d.ts
// These mirror the backend Motoko types

export interface Product {
  id: bigint;
  name: string;
  price: bigint;
  stock: bigint;
  outletId: bigint;
  createdAt: bigint;
  categoryId?: bigint;
  brandId?: bigint;
  isDeleted: boolean;
}

export interface Category {
  id: bigint;
  name: string;
  description: string;
  createdAt: bigint;
  isActive: boolean;
}

export interface Brand {
  id: bigint;
  name: string;
  description: string;
  createdAt: bigint;
  isActive: boolean;
}

export interface PackageComponent {
  productId: bigint;
  quantity: bigint;
}

export interface ProductPackage {
  id: bigint;
  name: string;
  price: bigint;
  components: PackageComponent[];
  outletId: bigint;
  createdAt: bigint;
  isActive: boolean;
}

export interface BundleItem {
  productId: bigint;
  packageId: bigint | null;
  quantity: bigint;
  isPackage: boolean;
}

export interface Bundle {
  id: bigint;
  name: string;
  price: bigint;
  items: BundleItem[];
  outletId: bigint;
  createdAt: bigint;
  isActive: boolean;
}

export interface PaymentMethod {
  category: PaymentCategory;
  subCategory?: PaymentSubCategory;
  methodName: string;
  amount: bigint;
}

export type PaymentCategory = {
  __kind__: 'offline';
} | {
  __kind__: 'online';
} | {
  __kind__: 'foodDelivery';
};

export type PaymentSubCategory = {
  __kind__: 'eWallet';
} | {
  __kind__: 'qris';
} | {
  __kind__: 'shopeeFood';
} | {
  __kind__: 'goFood';
} | {
  __kind__: 'grabFood';
} | {
  __kind__: 'maximFood';
} | {
  __kind__: 'tiktok';
};

export interface TransactionItem {
  productId: bigint;
  quantity: bigint;
  price: bigint;
  isPackage: boolean;
}
