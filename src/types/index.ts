// ============================================================
// Mangkasir F&B — Type Definitions
// ============================================================

// ---------- Addon ----------
export interface Addon {
  id: string;
  name: string;
  price: number;
}

// ---------- Raw Material ----------
export interface RawMaterial {
  id: string;
  name: string;
  stock: number;
  unit: string;
}

export interface RecipeIngredient {
  materialId: string;
  qtyNeeded: number;
}

// ---------- Product ----------
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  recipe: string[];
  recipeIngredients?: RecipeIngredient[];
  addons: {
    mandatory: Addon[];
    optional: Addon[];
  };
}

// ---------- Order Item ----------
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  selectedAddons: Addon[];
  notes?: string;
  isPaid?: boolean;
}

export interface OrderItemUnit {
  unitId: string;
  orderItemId: string;
  productId: string;
  productName: string;
  price: number;
  selectedAddons: Addon[];
  notes?: string;
  isPaid?: boolean;
}

export interface PaymentSelection {
  unitId: string;
  selected: boolean;
}

// ---------- Table ----------
export type TableStatus =
  | "empty"
  | "new_order"
  | "cooking"
  | "ready_deliver"
  | "eating"
  | "cleaning";

export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  currentOrder: OrderItem[];
}

// ---------- KDS (Kitchen Display System) ----------
export type KDSStatus = "new" | "processing" | "done";

export interface KDSOrder {
  orderId: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  status: KDSStatus;
  createdAt: string;
}

// ---------- Transaction ----------
export type PaymentMethod = "cash" | "qris";

export interface Transaction {
  id: string;
  tableId: string;
  tableName: string;
  items: OrderItemUnit[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paidAt: string;
  cashReceived?: number;
  change?: number;
}
