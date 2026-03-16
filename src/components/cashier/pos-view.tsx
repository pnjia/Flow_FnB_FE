"use client";

import { useState, useMemo } from "react";
import {
  Users,
  UtensilsCrossed,
  Clock,
  Truck,
  Coffee,
  Sparkles,
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Receipt,
  Check,
  ArrowRight,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store";
import { Table, Product, OrderItem, TableStatus, Addon } from "@/types";
import { PaymentDialog } from "@/components/payment-dialog";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

// ============================================================
// Helpers
// ============================================================
function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getItemTotal(item: OrderItem) {
  const addonTotal = item.selectedAddons.reduce((a, ad) => a + ad.price, 0);
  return (item.price + addonTotal) * item.quantity;
}

const STATUS_CONFIG: Record<
  TableStatus,
  {
    label: string;
    dotColor: string;
    bgClass: string;
    borderClass: string;
    icon: React.ElementType;
  }
> = {
  empty: {
    label: "Empty",
    dotColor: "bg-emerald-500",
    bgClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    borderClass: "border-emerald-500/30",
    icon: Coffee,
  },
  new_order: {
    label: "New Order",
    dotColor: "bg-orange-500",
    bgClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    borderClass: "border-orange-500/50",
    icon: Clock,
  },
  cooking: {
    label: "Cooking",
    dotColor: "bg-red-500",
    bgClass: "bg-red-500/10 text-red-700 dark:text-red-400",
    borderClass: "border-red-500/50",
    icon: UtensilsCrossed,
  },
  ready_deliver: {
    label: "Ready",
    dotColor: "bg-blue-500",
    bgClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    borderClass: "border-blue-500/50",
    icon: Truck,
  },
  eating: {
    label: "Eating",
    dotColor: "bg-gray-400",
    bgClass: "bg-gray-400/10 text-gray-600 dark:text-gray-400",
    borderClass: "border-gray-300/50",
    icon: Users,
  },
  cleaning: {
    label: "Cleaning",
    dotColor: "bg-amber-400",
    bgClass: "bg-amber-400/10 text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-400/50",
    icon: Sparkles,
  },
};

// ============================================================
// POS View Component
// ============================================================
export function PosView() {
  const tables = useAppStore((s) => s.tables);
  const products = useAppStore((s) => s.products);
  const updateTableStatus = useAppStore((s) => s.updateTableStatus);
  const setTableOrder = useAppStore((s) => s.setTableOrder);
  const addKDSOrder = useAppStore((s) => s.addKDSOrder);
  const markTableEmpty = useAppStore((s) => s.markTableEmpty);

  const [selectedTable, setSelectedTable] = useState<Table | null>(
    tables[0] || null,
  );
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Catalog filters
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return ["Semua", ...cats];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        activeCategory === "Semua" || p.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // Cart logic
  const cartTotal = cart.reduce((sum, i) => sum + getItemTotal(i), 0);
  const currentOrderTotal =
    selectedTable?.currentOrder
      .filter((i) => !i.isPaid)
      .reduce((sum, i) => sum + getItemTotal(i), 0) ?? 0;

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    setCart([]); // Clear scratchpad when changing tables
  };

  const handleCleanTable = () => {
    if (selectedTable?.status === "cleaning") {
      markTableEmpty(selectedTable.id);
      setSelectedTable(tables.find((t) => t.id === selectedTable.id) || null);
    }
  };

  const handleSaveOrder = () => {
    if (!selectedTable || cart.length === 0) return;

    // In cashier mode, we might just be adding to order directly
    const mergedOrder = [...selectedTable.currentOrder, ...cart];

    // Update store
    if (selectedTable.status === "empty") {
      updateTableStatus(selectedTable.id, "new_order");
    }
    setTableOrder(selectedTable.id, mergedOrder);

    // For cashier, we can automatically validate/send to kitchen instead of waiting for waiter
    // Wait, let's keep it "new_order" so they can validate, OR maybe cashier auto-sends it?
    // "Confirm whether cashier can bypass waiter validation or must follow same gate as /menu."
    // Let's assume cashier can send directly to kitchen to save clicks.

    addKDSOrder({
      orderId: `order-${Date.now()}`,
      tableId: selectedTable.id,
      tableName: selectedTable.name,
      items: cart, // send only new items
      status: "new",
      createdAt: new Date().toISOString(),
    });

    if (
      selectedTable.status === "empty" ||
      selectedTable.status === "new_order"
    ) {
      updateTableStatus(selectedTable.id, "cooking");
    }

    setCart([]);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-muted/10">
      {/* LEFT COLUMN: Tables */}
      <div className="w-80 border-r bg-background flex flex-col shrink-0">
        <div className="p-4 border-b bg-card">
          <h2 className="font-bold text-lg leading-tight">Meja</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pilih meja untuk interaksi
          </p>
        </div>
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-2">
            {tables.map((table) => {
              const config = STATUS_CONFIG[table.status];
              const isSelected = selectedTable?.id === table.id;

              return (
                <div
                  key={table.id}
                  onClick={() => handleSelectTable(table)}
                  className={cn(
                    "flex flex-col p-3 rounded-lg border cursor-pointer transition-all",
                    isSelected
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-900/10 shadow-sm"
                      : "border-transparent hover:border-border hover:bg-muted/50",
                  )}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm">{table.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] h-5 px-1.5",
                        config.bgClass,
                        config.borderClass,
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full mr-1.5",
                          config.dotColor,
                        )}
                      />
                      {config.label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{table.currentOrder.length} item</span>
                    {table.currentOrder.length > 0 && (
                      <span className="font-medium text-foreground">
                        {formatRp(
                          table.currentOrder.reduce(
                            (sum, i) => sum + getItemTotal(i),
                            0,
                          ),
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* CENTER COLUMN: Catalog */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/50">
        <div className="p-4 border-b bg-background flex flex-col gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border bg-muted/30 outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  activeCategory === cat
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const hasMandatory = product.addons.mandatory.length > 0;
              const hasOptional = product.addons.optional.length > 0;

              return (
                <Card
                  key={product.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-sky-500/30 active:scale-[0.98]"
                  onClick={() => {
                    setSelectedProduct(product);
                    setAddonDialogOpen(true);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        {/* Tags could be added here if needed */}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-bold text-sky-600 dark:text-sky-400">
                          {formatRp(product.price)}
                        </p>
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500/10">
                          <Plus className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT COLUMN: Order / Cart */}
      <div className="w-80 lg:w-96 border-l bg-background flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
        <div className="p-4 border-b bg-card">
          <h2 className="font-bold text-lg leading-tight">
            Pesanan: {selectedTable?.name || "Pilih Meja"}
          </h2>
          <Badge
            variant="secondary"
            className="mt-1 text-xs px-1.5 font-normal"
          >
            Status:{" "}
            {selectedTable ? STATUS_CONFIG[selectedTable.status].label : "-"}
          </Badge>
        </div>

        <ScrollArea className="flex-1 p-4">
          {!selectedTable ? (
            <div className="h-full flex flex-col justify-center items-center text-muted-foreground opacity-50 py-20">
              <UtensilsCrossed className="w-12 h-12 border rounded-full p-2 mb-3" />
              <p className="font-medium text-sm">Pilih meja terlebih dahulu</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Existing Order Items */}
              {selectedTable.currentOrder.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Pesanan Aktif
                  </h4>
                  <div className="space-y-3">
                    {selectedTable.currentOrder.map((item, idx) => (
                      <div key={item.id + idx} className="flex gap-3 text-sm">
                        <span className="font-bold text-muted-foreground w-6 text-right shrink-0">
                          {item.quantity}x
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium leading-tight flex items-center gap-2">
                            {item.productName}
                            {item.isPaid && (
                              <Badge
                                variant="outline"
                                className="h-4 px-1 text-[8px] bg-emerald-50 text-emerald-600 border-emerald-200"
                              >
                                Lunas
                              </Badge>
                            )}
                          </p>
                          {item.selectedAddons.length > 0 && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                              +{" "}
                              {item.selectedAddons
                                .map((a) => a.name)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        <span
                          className={cn(
                            "font-semibold shrink-0",
                            item.isPaid && "text-emerald-600",
                          )}
                        >
                          {formatRp(getItemTotal(item))}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t text-sm">
                    <span className="text-muted-foreground">Total Pesanan</span>
                    <span className="font-semibold">
                      {formatRp(currentOrderTotal)}
                    </span>
                  </div>
                </div>
              )}

              {/* Draft Cart Items */}
              {cart.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-3 h-3" />
                    Keranjang Baru
                  </h4>
                  <div className="space-y-3">
                    {cart.map((item, idx) => (
                      <div
                        key={item.id + idx}
                        className="flex flex-col gap-1 border border-sky-100 dark:border-sky-900/50 bg-sky-50/30 dark:bg-sky-900/10 p-2.5 rounded-lg"
                      >
                        <div className="flex justify-between text-sm">
                          <div className="flex gap-2">
                            <span className="font-bold text-sky-600 dark:text-sky-400 w-5">
                              {item.quantity}x
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight">
                                {item.productName}
                              </p>
                              {item.selectedAddons.length > 0 && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                                  +{" "}
                                  {item.selectedAddons
                                    .map((a) => a.name)
                                    .join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-bold">
                            {formatRp(getItemTotal(item))}
                          </span>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] text-red-500 hover:text-red-600 px-2"
                            onClick={() =>
                              setCart((c) => c.filter((i) => i.id !== item.id))
                            }
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTable.currentOrder.length === 0 && cart.length === 0 && (
                <div className="text-center text-sm text-muted-foreground italic py-10 opacity-70">
                  Belum ada pesanan
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Action Buttons */}
        <div className="p-4 border-t bg-card space-y-3 shrink-0">
          {selectedTable?.status === "cleaning" ? (
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold flex gap-2"
              onClick={handleCleanTable}
            >
              <Sparkles className="w-4 h-4" />
              Selesai Bersihkan Meja
            </Button>
          ) : (
            <>
              {cart.length > 0 || selectedTable?.currentOrder.length ? (
                <div className="flex justify-between font-bold text-lg mb-2 px-1">
                  <span>Total Bill</span>
                  <span className="text-sky-600 dark:text-sky-400">
                    {formatRp(currentOrderTotal + cartTotal)}
                  </span>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className={cn(
                    "border-sky-500/50 text-sky-700 hover:bg-sky-50",
                    cart.length === 0 && "opacity-50",
                  )}
                  disabled={cart.length === 0}
                  onClick={handleSaveOrder}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Dapur
                </Button>
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 shadow-md transition-all active:scale-95"
                  disabled={
                    !selectedTable || selectedTable.currentOrder.length === 0
                  }
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Bayar Tagihan
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Addon Dialog extracted logic */}
      <DashboardAddonDialog
        product={selectedProduct}
        open={addonDialogOpen}
        onClose={() => {
          setAddonDialogOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={(item) => setCart((c) => [...c, item])}
      />

      {/* Shared Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        table={selectedTable}
        onSuccess={() => {
          // Refetch selectedTable from store after payment modifies it
          const updatedTable = useAppStore
            .getState()
            .tables.find((t) => t.id === selectedTable?.id);
          setSelectedTable(updatedTable || null);
        }}
      />
    </div>
  );
}

// Inline Addon Dialog to avoid deep nesting
function DashboardAddonDialog({
  product,
  open,
  onClose,
  onAddToCart,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (item: OrderItem) => void;
}) {
  const [selectedMandatory, setSelectedMandatory] = useState<string>("");
  const [selectedOptionals, setSelectedOptionals] = useState<Set<string>>(
    new Set(),
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const resetAndOpen = () => {
    setSelectedMandatory(
      product.addons.mandatory.length > 0 ? product.addons.mandatory[0].id : "",
    );
    setSelectedOptionals(new Set());
    setQuantity(1);
  };

  const handleSave = () => {
    if (product.addons.mandatory.length > 0 && !selectedMandatory) return;

    const addons: Addon[] = [];
    if (selectedMandatory) {
      const m = product.addons.mandatory.find(
        (a) => a.id === selectedMandatory,
      );
      if (m) addons.push(m);
    }
    selectedOptionals.forEach((id) => {
      const o = product.addons.optional.find((a) => a.id === id);
      if (o) addons.push(o);
    });

    onAddToCart({
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.price,
      selectedAddons: addons,
    });
    onClose();
  };

  const addonTotal =
    (selectedMandatory
      ? product.addons.mandatory.find((a) => a.id === selectedMandatory)
          ?.price || 0
      : 0) +
    Array.from(selectedOptionals).reduce(
      (sum, id) =>
        sum + (product.addons.optional.find((a) => a.id === id)?.price || 0),
      0,
    );

  const unitPrice = product.price + addonTotal;
  const lineTotal = unitPrice * quantity;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
        else resetAndOpen();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            {formatRp(product.price)} • Pilih varian
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {product.addons.mandatory.length > 0 && (
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Pilihan Wajib
              </Label>
              <RadioGroup
                value={selectedMandatory}
                onValueChange={setSelectedMandatory}
              >
                {product.addons.mandatory.map((addon) => (
                  <label
                    key={addon.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                  >
                    <RadioGroupItem value={addon.id} />
                    <span className="flex-1 text-sm">{addon.name}</span>
                    <span className="text-sm font-medium">
                      +{formatRp(addon.price)}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {product.addons.optional.length > 0 && (
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Tambahan (Opsional)
              </Label>
              {product.addons.optional.map((addon) => (
                <label
                  key={addon.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedOptionals.has(addon.id)}
                    onCheckedChange={(checked) => {
                      const next = new Set(selectedOptionals);
                      if (checked) next.add(addon.id);
                      else next.delete(addon.id);
                      setSelectedOptionals(next);
                    }}
                  />
                  <span className="flex-1 text-sm">{addon.name}</span>
                  <span className="text-sm font-medium">
                    +{formatRp(addon.price)}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-3 border-t">
            <Label className="text-sm font-semibold w-16">Jumlah</Label>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="font-bold w-6 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
            onClick={handleSave}
            disabled={product.addons.mandatory.length > 0 && !selectedMandatory}
          >
            <Check className="h-4 w-4 mr-2" />
            Tambah ke Keranjang — {formatRp(lineTotal)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
