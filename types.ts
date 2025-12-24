
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum InventoryStatus {
  IN_HAND = 'IN_HAND',
  PERSONAL = 'PERSONAL',
  SOLD = 'SOLD'
}

export interface Product {
  id: string;
  name: string;
  image: string;
  distributorPrice: number;
  retailPrice: number;
  category: string;
  status: 'Active' | 'Inactive';
  stock: number; // Current available quantity at Stock Point
}

export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  status: InventoryStatus;
  note?: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  profileImage?: string;
  investedAmount: number;
  spentAmount: number;
  idNumber: string;
  motivationLogo?: string;
  salesTarget: number;
}

export interface BillingItem {
  productId: string;
  quantity: number;
}

export interface Transaction {
  id: string;
  userId: string;
  items: BillingItem[];
  totalDP: number;
  totalRP: number;
  timestamp: number;
}
