import { create } from "zustand";
import {
  Table,
  Product,
  KDSOrder,
  OrderItem,
  KDSStatus,
  TableStatus,
  Transaction,
  RawMaterial,
  RecipeIngredient,
  OrderItemUnit,
  PaymentSelection,
} from "@/types";
import {
  dummyTables,
  dummyProducts,
  dummyKDSQueue,
  dummyTransactionHistory,
  dummyRawMaterials,
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
  rawMaterials: RawMaterial[];

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
  payItems: (
    tableId: string,
    paidItemIds: string[],
    forcedStatus?: TableStatus,
  ) => void;

  // ---- Transaction Actions ----
  addTransaction: (tx: Transaction) => void;

  // ---- Product CRUD Actions ----
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // ---- Raw Material Actions ----
  addRawMaterial: (material: RawMaterial) => void;
  updateRawMaterial: (id: string, data: Partial<RawMaterial>) => void;
  deleteRawMaterial: (id: string) => void;

  // ---- Recipe Linking ----
  linkProductRecipe: (
    productId: string,
    ingredients: RecipeIngredient[],
  ) => void;

  // ---- Unitized Order Actions ----
  flattenOrderItemsToUnits: (items: OrderItem[]) => OrderItemUnit[];
  computeSelectedTotals: (
    units: OrderItemUnit[],
    selections: PaymentSelection[],
  ) => { subtotal: number; tax: number; total: number };
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
  rawMaterials: dummyRawMaterials,

  // ---- Table Actions ----
  updateTableStatus: (tableId: string, status: TableStatus) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status } : t,
      ),
    })),

  setTableOrder: (tableId: string, order: OrderItem[]) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, currentOrder: order } : t,
      ),
    })),

  addItemToTable: (tableId: string, item: OrderItem) =>
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
  addKDSOrder: (order: KDSOrder) =>
    set((state) => ({
      kdsQueue: [...state.kdsQueue, order],
    })),

  updateKDSStatus: (orderId: string, status: KDSStatus) =>
    set((state) => ({
      kdsQueue: state.kdsQueue.map((o) =>
        o.orderId === orderId ? { ...o, status } : o,
      ),
    })),

  removeKDSOrder: (orderId: string) =>
    set((state) => ({
      kdsQueue: state.kdsQueue.filter((o) => o.orderId !== orderId),
    })),

  // Composite: mark ticket done + update table to ready_deliver
  markKDSDone: (orderId: string) =>
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

  // Composite: pay items + set table to "cleaning" if order cleared
  payItems: (
    tableId: string,
    paidItemIds: string[],
    forcedStatus?: TableStatus,
  ) =>
    set((state) => {
      const paidCounts = paidItemIds.reduce(
        (acc: Record<string, number>, id: string) => {
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        tables: state.tables.map((t) => {
          if (t.id !== tableId) return t;

          const nextOrder: OrderItem[] = [];
          t.currentOrder.forEach((item) => {
            const paidQty = paidCounts[item.id] || 0;
            if (paidQty > 0 && !item.isPaid) {
              // Split into paid and unpaid parts
              nextOrder.push({
                ...item,
                id: `${item.id}-paid-${Date.now()}`,
                quantity: paidQty,
                isPaid: true,
              });

              if (item.quantity > paidQty) {
                nextOrder.push({
                  ...item,
                  quantity: item.quantity - paidQty,
                });
              }
            } else {
              nextOrder.push(item);
            }
          });

          const unpaidItemsCount = nextOrder.filter((i) => !i.isPaid).length;

          return {
            ...t,
            currentOrder: nextOrder,
            status:
              forcedStatus || (unpaidItemsCount === 0 ? "cleaning" : t.status),
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

  // ---- Raw Material Actions ----
  addRawMaterial: (material) =>
    set((state) => ({
      rawMaterials: [...state.rawMaterials, material],
    })),

  updateRawMaterial: (id, data) =>
    set((state) => ({
      rawMaterials: state.rawMaterials.map((rm) =>
        rm.id === id ? { ...rm, ...data } : rm,
      ),
    })),

  deleteRawMaterial: (id) =>
    set((state) => ({
      rawMaterials: state.rawMaterials.filter((rm) => rm.id !== id),
    })),

  // ---- Recipe Linking ----
  linkProductRecipe: (productId, ingredients) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, recipeIngredients: ingredients } : p,
      ),
    })),

  // ---- Unitized Order Actions ----
  flattenOrderItemsToUnits: (items) => {
    const units: OrderItemUnit[] = [];
    items.forEach((item) => {
      if (item.isPaid) return;
      for (let i = 0; i < item.quantity; i++) {
        units.push({
          unitId: `${item.id}-${i}`,
          orderItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          selectedAddons: item.selectedAddons,
          notes: item.notes,
          isPaid: item.isPaid,
        });
      }
    });
    return units;
  },

  computeSelectedTotals: (units, selections) => {
    let subtotal = 0;
    const selectedUnitIds = new Set(
      selections.filter((s) => s.selected).map((s) => s.unitId),
    );

    units.forEach((unit) => {
      if (selectedUnitIds.has(unit.unitId)) {
        let itemTotal = unit.price;
        unit.selectedAddons.forEach((addon) => {
          itemTotal += addon.price;
        });
        subtotal += itemTotal;
      }
    });

    const tax = subtotal * 0.1;
    return {
      subtotal,
      tax,
      total: subtotal + tax,
    };
  },
}));
