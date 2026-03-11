"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  Wallet,
  QrCode,
  Receipt,
  ArrowLeft,
  Check,
  SplitSquareVertical,
  Banknote,
  Calculator,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store";
import { OrderItem } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ============================================================
// Helper: format IDR
// ============================================================
function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getItemTotal(item: OrderItem) {
  const addonTotal = item.selectedAddons.reduce((a, ad) => a + ad.price, 0);
  return (item.price + addonTotal) * item.quantity;
}

// ============================================================
// Quick Cash Presets
// ============================================================
const CASH_PRESETS = [50000, 100000, 150000, 200000];

// ============================================================
// Order Item Row
// ============================================================
function OrderItemRow({
  item,
  splitActive,
  checked,
  onToggle,
}: {
  item: OrderItem;
  splitActive: boolean;
  checked: boolean;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const lineTotal = getItemTotal(item);

  return (
    <div
      className={cn(
        "flex items-start gap-3 py-3 px-3 rounded-lg transition-colors",
        splitActive && checked && "bg-sky-500/5",
        splitActive && !checked && "opacity-50",
      )}
    >
      {splitActive && (
        <Checkbox
          checked={checked}
          onCheckedChange={(c) => onToggle(item.id, !!c)}
          className="mt-0.5"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              <span className="text-orange-600 dark:text-orange-400 font-bold">
                {item.quantity}x
              </span>{" "}
              {item.productName}
            </p>
            {item.selectedAddons.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.selectedAddons.map((addon) => (
                  <span
                    key={addon.id}
                    className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                  >
                    {addon.name}
                    {addon.price > 0 && ` +${formatRp(addon.price)}`}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span className="text-sm font-semibold shrink-0">
            {formatRp(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Payment Modal
// ============================================================
function PaymentModal({
  open,
  onClose,
  total,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  total: number;
  onComplete: () => void;
}) {
  const [cashReceived, setCashReceived] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [completed, setCompleted] = useState(false);

  const cashAmount = parseInt(cashReceived) || 0;
  const change = cashAmount - total;
  const canCompleteCash = cashAmount >= total;

  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => {
      setCompleted(false);
      setCashReceived("");
      onComplete();
    }, 1500);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !completed) {
          onClose();
          setCashReceived("");
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!completed}>
        {completed ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 animate-in zoom-in-50 duration-300">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold">Pembayaran Berhasil!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {formatRp(total)} •{" "}
                {paymentMethod === "cash" ? "Tunai" : "QRIS"}
              </p>
              {paymentMethod === "cash" && change > 0 && (
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  Kembalian: {formatRp(change)}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Payment form */
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pembayaran
              </DialogTitle>
              <DialogDescription>
                Total:{" "}
                <span className="font-bold text-foreground text-base">
                  {formatRp(total)}
                </span>
              </DialogDescription>
            </DialogHeader>

            <Tabs
              defaultValue="cash"
              onValueChange={(v) => setPaymentMethod(v as string)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="cash" className="flex-1 gap-1.5">
                  <Banknote className="h-4 w-4" />
                  Tunai
                </TabsTrigger>
                <TabsTrigger value="qris" className="flex-1 gap-1.5">
                  <QrCode className="h-4 w-4" />
                  QRIS
                </TabsTrigger>
              </TabsList>

              {/* ---- Cash Tab ---- */}
              <TabsContent value="cash">
                <div className="space-y-4 pt-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Uang Diterima
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                        Rp
                      </span>
                      <Input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder="0"
                        className="pl-9 h-12 text-lg font-bold"
                      />
                    </div>
                    {/* Quick amount buttons */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {CASH_PRESETS.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setCashReceived(String(amount))}
                        >
                          {formatRp(amount)}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-orange-500/30 text-orange-600"
                        onClick={() => setCashReceived(String(total))}
                      >
                        Uang Pas
                      </Button>
                    </div>
                  </div>

                  {/* Change calculation */}
                  {cashAmount > 0 && (
                    <Card
                      className={cn(
                        "transition-colors",
                        canCompleteCash
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-red-500/30 bg-red-500/5",
                      )}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Kembalian</span>
                        </div>
                        <span
                          className={cn(
                            "text-lg font-bold",
                            canCompleteCash
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400",
                          )}
                        >
                          {canCompleteCash
                            ? formatRp(change)
                            : `Kurang ${formatRp(Math.abs(change))}`}
                        </span>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* ---- QRIS Tab ---- */}
              <TabsContent value="qris">
                <div className="flex flex-col items-center py-4 gap-3">
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-dashed border-border">
                    <Image
                      src="/qris-placeholder.png"
                      alt="QRIS Payment QR Code"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan QR untuk membayar{" "}
                    <span className="font-bold text-foreground">
                      {formatRp(total)}
                    </span>
                  </p>
                  <Badge variant="outline" className="gap-1.5 text-xs">
                    <QrCode className="h-3 w-3" />
                    Menunggu pembayaran...
                  </Badge>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-11"
                onClick={handleComplete}
                disabled={paymentMethod === "cash" && !canCompleteCash}
              >
                <Wallet className="h-4 w-4" />
                Selesaikan Pembayaran
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Checkout Page
// ============================================================
export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const params = useParams();
  const router = useRouter();
  const tableIdParam = String(params.tableId);
  const tableId = `table-${tableIdParam.padStart(2, "0")}`;

  const table = useAppStore((s) => s.tables.find((t) => t.id === tableId));
  const payItems = useAppStore((s) => s.payItems);

  const items = table?.currentOrder ?? [];

  // Split bill state
  const [splitActive, setSplitActive] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [paymentOpen, setPaymentOpen] = useState(false);

  // When split is toggled on, select all items by default
  const handleSplitToggle = (checked: boolean) => {
    setSplitActive(checked);
    if (checked) {
      setCheckedItems(new Set(items.map((i) => i.id)));
    } else {
      setCheckedItems(new Set());
    }
  };

  const handleToggleItem = (itemId: string, checked: boolean) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (checked) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  };

  const handleSelectAll = () => {
    setCheckedItems(new Set(items.map((i) => i.id)));
  };

  const handleDeselectAll = () => {
    setCheckedItems(new Set());
  };

  // Calculate totals based on selected items
  const activeItems = useMemo(() => {
    if (!splitActive) return items;
    return items.filter((i) => checkedItems.has(i.id));
  }, [splitActive, checkedItems, items]);

  const subtotal = useMemo(
    () => activeItems.reduce((sum, i) => sum + getItemTotal(i), 0),
    [activeItems],
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  // Full order total (for comparison)
  const fullSubtotal = items.reduce((sum, i) => sum + getItemTotal(i), 0);
  const fullTax = Math.round(fullSubtotal * 0.1);
  const fullTotal = fullSubtotal + fullTax;

  const handlePaymentComplete = () => {
    setPaymentOpen(false);

    // Get the IDs of items being paid
    const paidIds = activeItems.map((i) => i.id);

    // Update global state
    payItems(tableId, paidIds);

    // Redirect to POS
    router.push("/pos");
  };

  // Hydration guard: render skeleton until client mount
  if (!isMounted) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background max-w-7xl mx-auto items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-sky-500/20" />
          <h1 className="text-xl font-bold tracking-tight text-muted-foreground/50">
            Memuat Data Pembayaran...
          </h1>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-bold">Tidak ada pesanan</h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Meja {tableIdParam} belum memiliki pesanan. Kembali ke halaman POS
          untuk memilih meja lain.
        </p>
        <Link href="/pos">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke POS
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* ---- Header ---- */}
      <div className="px-4 md:px-6 py-4 border-b shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/pos">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 shadow-md shadow-sky-500/25">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Checkout</h1>
              <p className="text-xs text-muted-foreground">
                {table?.name} • {items.length} item •{" "}
                <span className="font-semibold">{formatRp(fullTotal)}</span>
              </p>
            </div>
          </div>

          {/* Split bill toggle */}
          <div className="flex items-center gap-2.5">
            <Label
              htmlFor="split-toggle"
              className="text-sm font-medium cursor-pointer hidden sm:block"
            >
              <SplitSquareVertical className="h-4 w-4 inline mr-1.5 align-[-3px]" />
              Split Bill
            </Label>
            <Switch
              id="split-toggle"
              checked={splitActive}
              onCheckedChange={handleSplitToggle}
            />
          </div>
        </div>
      </div>

      {/* ---- Split Screen Content ---- */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-6xl mx-auto w-full">
        {/* ---- LEFT: Order List ---- */}
        <div className="flex-1 overflow-y-auto border-r-0 md:border-r px-4 md:px-6 py-4">
          {/* Split bill controls */}
          {splitActive && (
            <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-sky-500/5 border border-sky-500/20">
              <p className="text-xs text-sky-700 dark:text-sky-400 font-medium">
                Pilih item untuk dibayar ({checkedItems.size}/{items.length})
              </p>
              <div className="flex gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleSelectAll}
                >
                  Semua
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleDeselectAll}
                >
                  Tidak ada
                </Button>
              </div>
            </div>
          )}

          <div className="divide-y divide-border/50">
            {items.map((item) => (
              <OrderItemRow
                key={item.id}
                item={item}
                splitActive={splitActive}
                checked={checkedItems.has(item.id)}
                onToggle={handleToggleItem}
              />
            ))}
          </div>
        </div>

        {/* ---- RIGHT: Summary & Payment ---- */}
        <div className="w-full md:w-[380px] shrink-0 overflow-y-auto px-4 md:px-6 py-4 bg-muted/20">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Ringkasan Pembayaran
          </h2>

          {/* Bill summary card */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              {/* Active items summary */}
              {splitActive && (
                <div className="text-xs text-muted-foreground mb-2">
                  {activeItems.length} dari {items.length} item dipilih
                </div>
              )}

              {activeItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[200px]">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-medium shrink-0">
                    {formatRp(getItemTotal(item))}
                  </span>
                </div>
              ))}

              {activeItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Pilih minimal 1 item untuk melanjutkan
                </p>
              )}

              <Separator />

              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatRp(subtotal)}</span>
              </div>

              {/* Tax */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pajak (10%)</span>
                <span className="font-medium">{formatRp(tax)}</span>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Total</span>
                <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                  {formatRp(total)}
                </span>
              </div>

              {/* Show remaining if split */}
              {splitActive &&
                activeItems.length > 0 &&
                activeItems.length < items.length && (
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Sisa belum dibayar</span>
                    <span>
                      {formatRp(fullTotal - total)} (
                      {items.length - activeItems.length} item)
                    </span>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Pay button */}
          <Button
            className={cn(
              "w-full h-12 gap-2 text-base font-semibold shadow-md",
              splitActive
                ? "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/25"
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25",
            )}
            onClick={() => setPaymentOpen(true)}
            disabled={activeItems.length === 0}
          >
            <Wallet className="h-5 w-5" />
            {splitActive ? "Bayar Terpilih" : "Bayar Semua"} — {formatRp(total)}
          </Button>

          {splitActive && (
            <p className="text-[11px] text-center text-muted-foreground mt-2">
              Item yang tidak dipilih akan tetap di meja
            </p>
          )}
        </div>
      </div>

      {/* ---- Payment Dialog ---- */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        total={total}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
}
