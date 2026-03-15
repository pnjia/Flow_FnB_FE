"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/store";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

// ============================================================
// Helper: format IDR
// ============================================================
function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// ============================================================
// Categories
// ============================================================
const CATEGORIES = ["Makanan", "Minuman", "Snack"];

// ============================================================
// Stock Badge
// ============================================================
function StockBadge({ stock }: { stock: number }) {
  if (stock < 10) {
    return (
      <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 text-xs">
        {stock}
      </Badge>
    );
  }
  if (stock < 20) {
    return (
      <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs">
        {stock}
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs">
      {stock}
    </Badge>
  );
}

// ============================================================
// Product Form Dialog
// ============================================================
function ProductFormDialog({
  open,
  onClose,
  product,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  product: Product | null; // null = new product
  onSave: (data: {
    name: string;
    category: string;
    price: number;
    stock: number;
    recipe: string[];
  }) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Makanan");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [recipeText, setRecipeText] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(String(product.price));
      setStock(String(product.stock));
      setRecipeText(product.recipe.join("\n"));
    } else {
      setName("");
      setCategory("Makanan");
      setPrice("");
      setStock("");
      setRecipeText("");
    }
  }, [product, open]);

  const isValid =
    name.trim() && category && parseInt(price) >= 0 && parseInt(stock) >= 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      name: name.trim(),
      category,
      price: parseInt(price) || 0,
      stock: parseInt(stock) || 0,
      recipe: recipeText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product ? (
              <>
                <Pencil className="h-4 w-4" />
                Edit Produk
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Tambah Produk Baru
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {product ? "Perbarui informasi produk." : "Isi detail produk baru."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">
              Nama Produk
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Nasi Goreng Spesial"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">
              Kategori
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">
              Harga (Rp)
            </Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min={0}
            />
          </div>

          {/* Stock */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Stok</Label>
            <Input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              min={0}
            />
          </div>

          {/* Recipe */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">
              Resep (satu langkah per baris)
            </Label>
            <Textarea
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              placeholder="Langkah 1&#10;Langkah 2&#10;Langkah 3"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
            onClick={handleSave}
            disabled={!isValid}
          >
            {product ? (
              <>
                <Pencil className="h-4 w-4" />
                Simpan Perubahan
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Tambah Produk
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Admin Products Page
// ============================================================
export default function AdminProductsPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const products = useAppStore((s) => s.products);
  const addProduct = useAppStore((s) => s.addProduct);
  const updateProduct = useAppStore((s) => s.updateProduct);
  const deleteProduct = useAppStore((s) => s.deleteProduct);

  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Filtered products
  const filtered = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products;

  const handleAdd = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleSave = (data: {
    name: string;
    category: string;
    price: number;
    stock: number;
    recipe: string[];
  }) => {
    if (editingProduct) {
      // Update existing product
      updateProduct(editingProduct.id, data);
    } else {
      // Create new product
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        ...data,
        addons: { mandatory: [], optional: [] },
      };
      addProduct(newProduct);
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Hydration guard
  if (!isMounted) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background max-w-7xl mx-auto items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-orange-500/20" />
          <h1 className="text-xl font-bold tracking-tight text-muted-foreground/50">
            Memuat Data Produk...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
      {/* ---- Header ---- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/25">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Manajemen Produk
            </h1>
            <p className="text-sm text-muted-foreground">
              {products.length} produk terdaftar
            </p>
          </div>
        </div>

        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-md shadow-orange-500/25"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {/* ---- Search ---- */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari nama produk atau kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md h-10 pl-9 pr-3 text-sm rounded-lg border bg-muted/30 outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ---- Product Table ---- */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="text-center">Resep</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-sm">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          product.category === "Makanan"
                            ? "border-red-500/30 text-red-700 dark:text-red-400"
                            : product.category === "Minuman"
                              ? "border-blue-500/30 text-blue-700 dark:text-blue-400"
                              : "border-amber-500/30 text-amber-700 dark:text-amber-400",
                        )}
                      >
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      {formatRp(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <StockBadge stock={product.stock} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {product.recipe.length > 0
                          ? `${product.recipe.length} langkah`
                          : "Belum ada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-orange-600"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ---- Product Form Dialog ---- */}
      <ProductFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSave}
      />

      {/* ---- Delete Confirmation ---- */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
