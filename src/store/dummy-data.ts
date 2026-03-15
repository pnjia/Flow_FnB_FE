import { Product, Table, KDSOrder, OrderItem, Transaction } from "@/types";

// ============================================================
// Dummy Products
// ============================================================
export const dummyProducts: Product[] = [
  {
    id: "prod-001",
    name: "Nasi Goreng Spesial",
    price: 28000,
    category: "Makanan",
    stock: 50,
    recipe: [
      "Panaskan minyak di wajan dengan api besar.",
      "Tumis bawang putih dan bawang merah hingga harum.",
      "Masukkan nasi putih, aduk rata.",
      "Tambahkan kecap manis, garam, dan merica. Aduk hingga merata.",
      "Sajikan dengan telur ceplok dan kerupuk.",
    ],
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
    stock: 40,
    recipe: [
      "Rebus mie hingga al dente, tiriskan.",
      "Tumis bumbu halus hingga harum.",
      "Masukkan mie, tambahkan kecap manis dan saus tiram.",
      "Aduk rata di atas api besar selama 2 menit.",
    ],
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
    stock: 25,
    recipe: [
      "Marinasi ayam dengan madu, kecap, bawang putih selama 30 menit.",
      "Panggang ayam di atas arang dengan api sedang.",
      "Olesi berulang kali dengan sisa bumbu marinasi.",
      "Panggang selama 20-25 menit hingga matang sempurna.",
      "Sajikan dengan sambal dan lalapan.",
    ],
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
    stock: 100,
    recipe: [
      "Seduh teh celup dalam air panas 200ml selama 3 menit.",
      "Tambahkan gula pasir 2 sendok makan, aduk rata.",
      "Tuang ke gelas berisi es batu penuh.",
    ],
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
    stock: 30,
    recipe: [
      "Ambil daging alpukat matang.",
      "Blender dengan susu cair, gula, dan es batu.",
      "Tuang ke gelas, tambahkan susu kental manis di atasnya.",
    ],
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
    stock: 60,
    recipe: [
      "Seduh espresso 2 shot menggunakan mesin kopi.",
      "Cairkan gula aren di microwave selama 15 detik.",
      "Tuang gula aren ke dasar gelas.",
      "Tambahkan es batu dan susu segar.",
      "Tuang espresso perlahan di atas susu.",
    ],
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
    stock: 45,
    recipe: [
      "Potong kentang memanjang, rendam air garam 10 menit.",
      "Tiriskan dan keringkan dengan tisu.",
      "Goreng dalam minyak panas 170°C selama 5-7 menit.",
      "Angkat, tiriskan, taburi garam dan bubuk paprika.",
    ],
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
    stock: 35,
    recipe: [
      "Olesi roti tawar dengan mentega di kedua sisi.",
      "Panggang di atas teflon dengan api kecil.",
      "Olesi coklat meses dan susu kental manis di satu sisi.",
      "Lipat dan panggang hingga kecokelatan.",
    ],
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
  {
    id: "table-07",
    name: "Meja 7",
    status: "cleaning",
    currentOrder: [],
  },
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

// ============================================================
// Dummy Transaction History
// ============================================================
export const dummyTransactionHistory: Transaction[] = [
  {
    id: "tx-001",
    tableId: "table-03",
    tableName: "Meja 3",
    items: [sampleOrderItems[2]],
    subtotal: 38000,
    tax: 3800,
    total: 41800,
    paymentMethod: "cash",
    paidAt: new Date(Date.now() - 60 * 60000).toISOString(),
    cashReceived: 50000,
    change: 8200,
  },
  {
    id: "tx-002",
    tableId: "table-06",
    tableName: "Meja 6",
    items: [sampleOrderItems[0], sampleOrderItems[1]],
    subtotal: 82000,
    tax: 8200,
    total: 90200,
    paymentMethod: "qris",
    paidAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: "tx-003",
    tableId: "table-01",
    tableName: "Meja 1",
    items: [sampleOrderItems[1]],
    subtotal: 16000,
    tax: 1600,
    total: 17600,
    paymentMethod: "cash",
    paidAt: new Date(Date.now() - 180 * 60000).toISOString(),
    cashReceived: 20000,
    change: 2400,
  },
];
