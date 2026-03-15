import { create } from "zustand";
import {
  Table,
  Product,
  KDSOrder,
  OrderItem,
  KDSStatus,
  TableStatus,
  Transaction,
} from "@/types";
import {
  dummyTables,
  dummyProducts,
  dummyKDSQueue,
  dummyTransactionHistory,
} from "./dummy-data";

// ============================================================
// Store Interface
// ============================================================
interface AppStore {
  // ---- State ----
  tables: Table[];
  products: Product[];
  kdsQueue: KDSOrder[];
  transactionHistory: Transaction[];

  // ---- Table Actions ----
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  setTableOrder: (tableId: string, order: OrderItem[]) => void;
  addItemToTable: (tableId: string, item: OrderItem) => void;
  removeItemFromTable: (tableId: string, itemId: string) => void;
  clearTableOrder: (tableId: string) => void;
  markTableCleaning: (tableId: string) => void;
  markTableEmpty: (tableId: string) => void;

  // ---- KDS Actions ----
  addKDSOrder: (order: KDSOrder) => void;
  updateKDSStatus: (orderId: string, status: KDSStatus) => void;
  removeKDSOrder: (orderId: string) => void;
  // Composite: mark KDS done + table ready_deliver
  markKDSDone: (orderId: string) => void;
  // Composite: pay items + set table to "cleaning" if order cleared
  payItems: (tableId: string, paidItemIds: string[]) => void;

  // ---- Transaction Actions ----
  addTransaction: (tx: Transaction) => void;

  // ---- Product CRUD Actions ----
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

// ============================================================
// Zustand Store
// ============================================================
export const useAppStore = create<AppStore>((set) => ({
  // ---- Initial State ----
  tables: dummyTables,
  products: dummyProducts,
  kdsQueue: dummyKDSQueue,
  transactionHistory: dummyTransactionHistory,

  // ---- Table Actions ----
  updateTableStatus: (tableId, status) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status } : t,
      ),
    })),

  setTableOrder: (tableId, order) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, currentOrder: order } : t,
      ),
    })),

  addItemToTable: (tableId, item) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? { ...t, currentOrder: [...t.currentOrder, item] }
          : t,
      ),
    })),

  removeItemFromTable: (tableId, itemId) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              currentOrder: t.currentOrder.filter((i) => i.id !== itemId),
            }
          : t,
      ),
    })),

  clearTableOrder: (tableId) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? { ...t, currentOrder: [], status: "empty" as TableStatus }
          : t,
      ),
    })),

  markTableCleaning: (tableId) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? { ...t, currentOrder: [], status: "cleaning" as TableStatus }
          : t,
      ),
    })),

  markTableEmpty: (tableId) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status: "empty" as TableStatus } : t,
      ),
    })),

  // ---- KDS Actions ----
  addKDSOrder: (order) =>
    set((state) => ({
      kdsQueue: [...state.kdsQueue, order],
    })),

  updateKDSStatus: (orderId, status) =>
    set((state) => ({
      kdsQueue: state.kdsQueue.map((o) =>
        o.orderId === orderId ? { ...o, status } : o,
      ),
    })),

  removeKDSOrder: (orderId) =>
    set((state) => ({
      kdsQueue: state.kdsQueue.filter((o) => o.orderId !== orderId),
    })),

  // Composite: mark ticket done + update table to ready_deliver
  markKDSDone: (orderId) =>
    set((state) => {
      const ticket = state.kdsQueue.find((o) => o.orderId === orderId);
      return {
        kdsQueue: state.kdsQueue.map((o) =>
          o.orderId === orderId ? { ...o, status: "done" as KDSStatus } : o,
        ),
        tables: ticket
          ? state.tables.map((t) =>
              t.id === ticket.tableId
                ? { ...t, status: "ready_deliver" as TableStatus }
                : t,
            )
          : state.tables,
      };
    }),

  // Composite: pay items + set table to "cleaning" if order is cleared
  payItems: (tableId, paidItemIds) =>
    set((state) => {
      return {
        tables: state.tables.map((t) => {
          if (t.id !== tableId) return t;
          const remaining = t.currentOrder.filter(
            (i) => !paidItemIds.includes(i.id),
          );
          return {
            ...t,
            currentOrder: remaining,
            status: remaining.length === 0 ? "cleaning" : t.status,
          } as typeof t;
        }),
      };
    }),

  // ---- Transaction Actions ----
  addTransaction: (tx) =>
    set((state) => ({
      transactionHistory: [tx, ...state.transactionHistory],
    })),

  // ---- Product CRUD Actions ----
  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),

  updateProduct: (id, data) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...data } : p,
      ),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
}));
