"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  ShoppingCart,
  Plus,
  Minus,
  UtensilsCrossed,
  Search,
  Check,
  CreditCard,
  QrCode,
  Wallet,
  Receipt,
  User,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentDialog } from "@/components/payment-dialog";
import { useAppStore } from "@/store";
import { Product, Addon, OrderItem, OrderItemUnit } from "@/types";
import { cn } from "@/lib/utils";

// ============================================================
// Helper: format IDR
// ============================================================
function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// ============================================================
// Product Card
// ============================================================
function ProductCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: (p: Product) => void;
}) {
  const hasMandatory = product.addons.mandatory.length > 0;
  const hasOptional = product.addons.optional.length > 0;

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-orange-500/30 active:scale-[0.98]"
      onClick={() => onSelect(product)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight mb-1 truncate">
              {product.name}
            </h3>
            <p className="text-base font-bold text-orange-600 dark:text-orange-400">
              {formatRp(product.price)}
            </p>
            {(hasMandatory || hasOptional) && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {hasMandatory && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-5 border-orange-500/20 text-orange-600 dark:text-orange-400"
                  >
                    {product.addons.mandatory.length} pilihan wajib
                  </Badge>
                )}
                {hasOptional && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-5"
                  >
                    +{product.addons.optional.length} tambahan
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
            <Plus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Add-on Dialog
// ============================================================
function AddonDialog({
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

  // Reset state when product changes
  const resetAndOpen = () => {
    if (product) {
      // Auto-select first mandatory if available
      setSelectedMandatory(
        product.addons.mandatory.length > 0
          ? product.addons.mandatory[0].id
          : "",
      );
      setSelectedOptionals(new Set());
      setQuantity(1);
    }
  };

  // Calculate total price for this item
  const selectedAddons = useMemo(() => {
    if (!product) return [];
    const addons: Addon[] = [];

    // Add selected mandatory addon
    if (selectedMandatory) {
      const mandatory = product.addons.mandatory.find(
        (a) => a.id === selectedMandatory,
      );
      if (mandatory) addons.push(mandatory);
    }

    // Add selected optional addons
    selectedOptionals.forEach((id) => {
      const optional = product.addons.optional.find((a) => a.id === id);
      if (optional) addons.push(optional);
    });

    return addons;
  }, [product, selectedMandatory, selectedOptionals]);

  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = (product?.price ?? 0) + addonTotal;
  const lineTotal = unitPrice * quantity;

  const handleToggleOptional = (id: string, checked: boolean) => {
    setSelectedOptionals((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSave = () => {
    if (!product) return;
    // Validate mandatory selection
    if (product.addons.mandatory.length > 0 && !selectedMandatory) return;

    const item: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.price,
      selectedAddons,
    };

    onAddToCart(item);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
        else resetAndOpen();
      }}
    >
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product?.name}</DialogTitle>
          <DialogDescription>
            {formatRp(product?.price ?? 0)} • Pilih varian dan tambahan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* ---- Mandatory Add-ons (RadioGroup) ---- */}
          {product && product.addons.mandatory.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Label className="text-sm font-semibold">Pilihan Wajib</Label>
                <Badge className="text-[10px] h-5 bg-orange-500 text-white">
                  Wajib
                </Badge>
              </div>
              <RadioGroup
                value={selectedMandatory}
                onValueChange={setSelectedMandatory}
                className="gap-0"
              >
                {product.addons.mandatory.map((addon) => (
                  <label
                    key={addon.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem value={addon.id} />
                    <span className="flex-1 text-sm">{addon.name}</span>
                    <span className="text-sm text-muted-foreground font-medium">
                      {addon.price > 0 ? `+${formatRp(addon.price)}` : "Gratis"}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* ---- Optional Add-ons (Checkboxes) ---- */}
          {product && product.addons.optional.length > 0 && (
            <div>
              {product.addons.mandatory.length > 0 && (
                <Separator className="mb-4" />
              )}
              <Label className="text-sm font-semibold mb-3 block">
                Tambahan (Opsional)
              </Label>
              <div className="space-y-0">
                {product.addons.optional.map((addon) => (
                  <label
                    key={addon.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedOptionals.has(addon.id)}
                      onCheckedChange={(checked) =>
                        handleToggleOptional(addon.id, !!checked)
                      }
                    />
                    <span className="flex-1 text-sm">{addon.name}</span>
                    <span className="text-sm text-muted-foreground font-medium">
                      {addon.price > 0 ? `+${formatRp(addon.price)}` : "Gratis"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ---- Quantity ---- */}
          <div>
            <Separator className="mb-4" />
            <Label className="text-sm font-semibold mb-3 block">Jumlah</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-bold w-8 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
            onClick={handleSave}
            disabled={
              product !== null &&
              product.addons.mandatory.length > 0 &&
              !selectedMandatory
            }
          >
            <Check className="h-4 w-4" />
            Simpan — {formatRp(lineTotal)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Cart Item Row (in the bottom sheet preview)
// ============================================================
function CartItemRow({
  item,
  onRemove,
}: {
  item: OrderItem;
  onRemove: (id: string) => void;
}) {
  const addonTotal = item.selectedAddons.reduce((a, ad) => a + ad.price, 0);
  const lineTotal = (item.price + addonTotal) * item.quantity;

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {item.quantity}x {item.productName}
        </p>
        {item.selectedAddons.length > 0 && (
          <p className="text-xs text-muted-foreground truncate">
            + {item.selectedAddons.map((a) => a.name).join(", ")}
          </p>
        )}
      </div>
      <span className="text-sm font-semibold shrink-0">
        {formatRp(lineTotal)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
        onClick={() => onRemove(item.id)}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ============================================================
// Main Menu Page
// ============================================================
export function MenuContent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const params = useParams();
  const router = useRouter();
  const tableIdParam = String(params.tableId);
  const tableId = `table-${tableIdParam.padStart(2, "0")}`;

  const products = useAppStore((s) => s.products);
  const table = useAppStore((s) => s.tables.find((t) => t.id === tableId));
  const updateTableStatus = useAppStore((s) => s.updateTableStatus);
  const setTableOrder = useAppStore((s) => s.setTableOrder);

  // Local cart state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);

  // Payment dialog state
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const computeTotals = useAppStore((s) => s.computeSelectedTotals);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const payItems = useAppStore((s) => s.payItems);

  // Categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return ["Semua", ...cats];
  }, [products]);

  // Filtered products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        activeCategory === "Semua" || p.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // Cart totals
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => {
    const addonTotal = i.selectedAddons.reduce((a, ad) => a + ad.price, 0);
    return sum + (i.price + addonTotal) * i.quantity;
  }, 0);

  // Handlers
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleAddToCart = (item: OrderItem) => {
    setCart((prev) => [...prev, item]);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handlePesanSekarang = () => {
    if (cart.length === 0 || !table) return;

    // Trigger payment dialog first
    setShowCart(false);
    setShowPayment(true);
  };

  // Payment Functions
  const handleOpenPayment = () => {
    if (!table || table.currentOrder.length === 0) return;
    setShowPayment(true);
  };

  // Hydration guard
  if (!isMounted) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-muted/20 items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20" />
          <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* ============================================================ */}
      {/* Sticky Header */}
      {/* ============================================================ */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3 max-w-2xl mx-auto">
          {/* Table indicator */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">
                Anda di {table?.name ?? `Meja ${tableIdParam}`}
              </h1>
              <p className="text-xs text-muted-foreground">
                Pilih menu lalu tekan &quot;Pesan Sekarang&quot;
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border bg-muted/30 outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  activeCategory === cat
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Product Grid */}
      {/* ============================================================ */}
      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <UtensilsCrossed className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">Tidak ada menu ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={handleSelectProduct}
              />
            ))}
          </div>
        )}

        {/* Bottom padding for sticky bar */}
        {cartItemCount > 0 && <div className="h-24" />}
      </div>

      {/* ============================================================ */}
      {/* Add-on Dialog */}
      {/* ============================================================ */}
      <AddonDialog
        product={selectedProduct}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />

      {/* ============================================================ */}
      {/* Cart Preview Dialog */}
      {/* ============================================================ */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Keranjang ({cartItemCount} item)</DialogTitle>
            <DialogDescription>
              Periksa pesanan sebelum dikirim ke dapur
            </DialogDescription>
          </DialogHeader>

          <div className="divide-y">
            {cart.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onRemove={handleRemoveFromCart}
              />
            ))}
          </div>

          {cart.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Keranjang masih kosong
            </p>
          )}

          <DialogFooter>
            <div className="w-full flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{formatRp(cartTotal)}</p>
              </div>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                onClick={() => {
                  setShowCart(false);
                  handlePesanSekarang();
                }}
                disabled={cart.length === 0}
              >
                <UtensilsCrossed className="h-4 w-4" />
                Pesan Sekarang
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Sticky Cart Bar (New Items) */}
      {/* ============================================================ */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-orange-500 text-white shadow-[0_-4px_20px_rgba(249,115,22,0.3)]">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setShowCart(true)}
              className="flex-1 flex items-center gap-3 text-left group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 transition-transform group-hover:scale-105">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium opacity-90">
                  {cartItemCount} Item di Keranjang
                </p>
                <p className="text-base font-bold">{formatRp(cartTotal)}</p>
              </div>
            </button>

            <Button
              onClick={() => setShowCart(true)}
              className="bg-white text-orange-600 hover:bg-white/90 px-6 h-11 gap-2 text-sm font-bold shadow-sm active:scale-95 transition-all"
            >
              Lihat Keranjang
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Table Status / Payment Bar (when order exists but cart empty) */}
      {/* ============================================================ */}
      {cartItemCount === 0 &&
        table &&
        table.currentOrder.some((i) => !i.isPaid) && (
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
              <button
                onClick={handleOpenPayment}
                className="flex-1 flex items-center gap-3 text-left group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 shadow-md shadow-emerald-500/25 transition-transform group-hover:scale-105">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Tagihan Meja
                  </p>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {table.currentOrder.length} Porsi
                  </p>
                </div>
              </button>

              <Button
                onClick={handleOpenPayment}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 h-11 gap-2 text-sm font-semibold shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
              >
                Bayar Tagihan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

      {/* ============================================================ */}
      {/* Payment Dialog */}
      {/* ============================================================ */}
      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        table={table || null}
        pendingItems={cart}
        onConfirmOrder={(items) => {
          if (!table) return;
          const mergedOrder = [...table.currentOrder, ...items];
          updateTableStatus(tableId, "new_order");
          setTableOrder(tableId, mergedOrder);
          setCart([]);
        }}
        onSuccess={() => {
          setCart([]);
          router.push("/pos");
        }}
      />
    </div>
  );
}
