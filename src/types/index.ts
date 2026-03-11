// ============================================================
// Mangkasir F&B — Type Definitions
// ============================================================

// ---------- Addon ----------
export interface Addon {
  id: string;
  name: string;
  price: number;
}

// ---------- Product ----------
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
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
}

// ---------- Table ----------
export type TableStatus =
  | "empty"
  | "new_order"
  | "cooking"
  | "ready_deliver"
  | "eating";

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
