import { Product, Table, KDSOrder, OrderItem } from "@/types";

// ============================================================
// Dummy Products
// ============================================================
export const dummyProducts: Product[] = [
  {
    id: "prod-001",
    name: "Nasi Goreng Spesial",
    price: 28000,
    category: "Makanan",
    addons: {
      mandatory: [
        { id: "add-001", name: "Nasi Putih", price: 0 },
        { id: "add-002", name: "Nasi Merah", price: 3000 },
      ],
      optional: [
        { id: "add-003", name: "Telur Ceplok", price: 5000 },
        { id: "add-004", name: "Kerupuk", price: 2000 },
      ],
    },
  },
  {
    id: "prod-002",
    name: "Mie Goreng Jawa",
    price: 25000,
    category: "Makanan",
    addons: {
      mandatory: [],
      optional: [
        { id: "add-005", name: "Telur Dadar", price: 5000 },
        { id: "add-006", name: "Bakso", price: 7000 },
      ],
    },
  },
  {
    id: "prod-003",
    name: "Ayam Bakar Madu",
    price: 35000,
    category: "Makanan",
    addons: {
      mandatory: [
        { id: "add-007", name: "Paha", price: 0 },
        { id: "add-008", name: "Dada", price: 5000 },
      ],
      optional: [
        { id: "add-009", name: "Sambal Extra", price: 3000 },
        { id: "add-010", name: "Lalapan", price: 4000 },
      ],
    },
  },
  {
    id: "prod-004",
    name: "Es Teh Manis",
    price: 8000,
    category: "Minuman",
    addons: {
      mandatory: [],
      optional: [
        { id: "add-011", name: "Lemon", price: 2000 },
        { id: "add-012", name: "Less Sugar", price: 0 },
      ],
    },
  },
  {
    id: "prod-005",
    name: "Jus Alpukat",
    price: 15000,
    category: "Minuman",
    addons: {
      mandatory: [],
      optional: [
        { id: "add-013", name: "Extra Coklat", price: 3000 },
        { id: "add-014", name: "Whipped Cream", price: 5000 },
      ],
    },
  },
  {
    id: "prod-006",
    name: "Kopi Susu Gula Aren",
    price: 22000,
    category: "Minuman",
    addons: {
      mandatory: [
        { id: "add-015", name: "Hot", price: 0 },
        { id: "add-016", name: "Iced", price: 0 },
      ],
      optional: [
        { id: "add-017", name: "Extra Shot", price: 5000 },
        { id: "add-018", name: "Oat Milk", price: 7000 },
      ],
    },
  },
  {
    id: "prod-007",
    name: "Kentang Goreng",
    price: 18000,
    category: "Snack",
    addons: {
      mandatory: [],
      optional: [
        { id: "add-019", name: "Cheese Sauce", price: 5000 },
        { id: "add-020", name: "Chili Flakes", price: 2000 },
      ],
    },
  },
  {
    id: "prod-008",
    name: "Roti Bakar Coklat",
    price: 16000,
    category: "Snack",
    addons: {
      mandatory: [],
      optional: [
        { id: "add-021", name: "Keju", price: 4000 },
        { id: "add-022", name: "Susu Kental Manis", price: 3000 },
      ],
    },
  },
];

// ============================================================
// Sample order items (used by tables & KDS)
// ============================================================
const sampleOrderItems: OrderItem[] = [
  {
    id: "item-001",
    productId: "prod-001",
    productName: "Nasi Goreng Spesial",
    quantity: 2,
    price: 28000,
    selectedAddons: [
      { id: "add-001", name: "Nasi Putih", price: 0 },
      { id: "add-003", name: "Telur Ceplok", price: 5000 },
    ],
  },
  {
    id: "item-002",
    productId: "prod-004",
    productName: "Es Teh Manis",
    quantity: 2,
    price: 8000,
    selectedAddons: [],
  },
  {
    id: "item-003",
    productId: "prod-003",
    productName: "Ayam Bakar Madu",
    quantity: 1,
    price: 35000,
    selectedAddons: [
      { id: "add-007", name: "Paha", price: 0 },
      { id: "add-009", name: "Sambal Extra", price: 3000 },
    ],
  },
];

// ============================================================
// Dummy Tables
// ============================================================
export const dummyTables: Table[] = [
  { id: "table-01", name: "Meja 1", status: "empty", currentOrder: [] },
  {
    id: "table-02",
    name: "Meja 2",
    status: "new_order",
    currentOrder: [sampleOrderItems[0], sampleOrderItems[1]],
  },
  {
    id: "table-03",
    name: "Meja 3",
    status: "cooking",
    currentOrder: [sampleOrderItems[2]],
  },
  {
    id: "table-04",
    name: "Meja 4",
    status: "ready_deliver",
    currentOrder: [sampleOrderItems[0]],
  },
  {
    id: "table-05",
    name: "Meja 5",
    status: "eating",
    currentOrder: [sampleOrderItems[1], sampleOrderItems[2]],
  },
  { id: "table-06", name: "Meja 6", status: "empty", currentOrder: [] },
  { id: "table-07", name: "Meja 7", status: "empty", currentOrder: [] },
  {
    id: "table-08",
    name: "Meja 8",
    status: "cooking",
    currentOrder: [sampleOrderItems[0], sampleOrderItems[2]],
  },
  { id: "table-09", name: "Meja 9", status: "empty", currentOrder: [] },
  {
    id: "table-10",
    name: "Meja 10",
    status: "eating",
    currentOrder: [sampleOrderItems[1]],
  },
];

// ============================================================
// Dummy KDS Queue
// ============================================================
export const dummyKDSQueue: KDSOrder[] = [
  {
    orderId: "order-001",
    tableId: "table-02",
    tableName: "Meja 2",
    items: [sampleOrderItems[0], sampleOrderItems[1]],
    status: "new",
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    orderId: "order-002",
    tableId: "table-03",
    tableName: "Meja 3",
    items: [sampleOrderItems[2]],
    status: "processing",
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    orderId: "order-003",
    tableId: "table-08",
    tableName: "Meja 8",
    items: [sampleOrderItems[0], sampleOrderItems[2]],
    status: "processing",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    orderId: "order-004",
    tableId: "table-04",
    tableName: "Meja 4",
    items: [sampleOrderItems[0]],
    status: "done",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
];
