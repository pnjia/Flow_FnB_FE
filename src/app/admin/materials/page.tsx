"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Beaker,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { RawMaterial } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// ============================================================
// Constants
// ============================================================
const UNITS = [
  "g",
  "ml",
  "pcs",
  "siung",
  "lembar",
  "sdm",
  "sdt",
  "bungkus",
  "botol",
];

// ============================================================
// Stock Badge
// ============================================================
function StockBadge({ stock, unit }: { stock: number; unit: string }) {
  const isLow = stock < 100 && (unit === "g" || unit === "ml");
  const isSuperLow =
    stock < 10 && (unit === "pcs" || unit === "siung" || unit === "lembar");

  if (stock <= 0) {
    return (
      <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 text-xs">
        Habis ({stock} {unit})
      </Badge>
    );
  }
  if (isLow || isSuperLow) {
    return (
      <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs">
        {stock} {unit}
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs">
      {stock} {unit}
    </Badge>
  );
}

// ============================================================
// Raw Material Form Dialog
// ============================================================
function MaterialFormDialog({
  open,
  onClose,
  material,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  material: RawMaterial | null; // null = new material
  onSave: (data: { name: string; stock: number; unit: string }) => void;
}) {
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("g");

  // Populate form when editing
  useEffect(() => {
    if (material) {
      setName(material.name);
      setStock(String(material.stock));
      setUnit(material.unit);
    } else {
      setName("");
      setStock("");
      setUnit("g");
    }
  }, [material, open]);

  const isValid = name.trim() && parseInt(stock) >= 0 && unit.trim();

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      name: name.trim(),
      stock: parseInt(stock) || 0,
      unit: unit.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {material ? (
              <>
                <Pencil className="h-4 w-4" />
                Edit Bahan Baku
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Tambah Bahan Baku
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {material
              ? "Perbarui informasi stok bahan baku."
              : "Isi detail bahan baku baru."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">
              Nama Bahan Baku
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Bawang Merah"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Stock */}
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">
                Stok Saat Ini
              </Label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                min={0}
              />
            </div>

            {/* Unit */}
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">
                Satuan Ukur
              </Label>
              <Select
                value={unit}
                onValueChange={(val) => {
                  if (val) setUnit(val);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
            onClick={handleSave}
            disabled={!isValid}
          >
            {material ? (
              <>
                <Pencil className="h-4 w-4" />
                Simpan Perubahan
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Tambah Bahan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Admin Raw Materials Page
// ============================================================
export default function AdminMaterialsPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const materials = useAppStore((s) => s.rawMaterials);
  const products = useAppStore((s) => s.products); // Useful for deletion guard later
  const addRawMaterial = useAppStore((s) => s.addRawMaterial);
  const updateRawMaterial = useAppStore((s) => s.updateRawMaterial);
  const deleteRawMaterial = useAppStore((s) => s.deleteRawMaterial);

  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<RawMaterial | null>(null);
  const [cantDeleteReason, setCantDeleteReason] = useState<string | null>(null);

  // Filtered
  const filtered = searchQuery
    ? materials.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : materials;

  const handleAdd = () => {
    setEditingMaterial(null);
    setFormOpen(true);
  };

  const handleEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    setFormOpen(true);
  };

  const handleSave = (data: { name: string; stock: number; unit: string }) => {
    if (editingMaterial) {
      updateRawMaterial(editingMaterial.id, data);
    } else {
      const newMaterial: RawMaterial = {
        id: `rm-${Date.now()}`,
        ...data,
      };
      addRawMaterial(newMaterial);
    }
  };

  const requestDelete = (material: RawMaterial) => {
    // Check if any product depends on this material
    const dependentProducts = products.filter((p) =>
      p.recipeIngredients?.some((ri) => ri.materialId === material.id),
    );

    if (dependentProducts.length > 0) {
      const names = dependentProducts.map((p) => p.name).join(", ");
      setCantDeleteReason(
        `Material ini digunakan oleh produk menu: ${names}. Hapus atau ubah resep produk-produk tersebut sebelum menghapus bahan baku ini.`,
      );
      setDeleteTarget(material);
    } else {
      setCantDeleteReason(null);
      setDeleteTarget(material);
    }
  };

  const handleDelete = () => {
    if (deleteTarget && !cantDeleteReason) {
      deleteRawMaterial(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background max-w-7xl mx-auto items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-amber-500/20" />
          <h1 className="text-xl font-bold tracking-tight text-muted-foreground/50">
            Memuat Data Bahan Baku...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
      {/* ---- Navigation ---- */}
      <Link
        href="/admin"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Panel Admin
      </Link>

      {/* ---- Header ---- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 shadow-md shadow-amber-500/25">
            <Beaker className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Manajemen Bahan Baku
            </h1>
            <p className="text-sm text-muted-foreground">
              {materials.length} bahan baku terdaftar
            </p>
          </div>
        </div>

        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white gap-2 shadow-md shadow-amber-500/25"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" />
          Tambah Bahan
        </Button>
      </div>

      {/* ---- Search ---- */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari nama bahan baku..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md h-10 pl-9 pr-3 text-sm rounded-lg border bg-muted/30 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
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

      {/* ---- Table ---- */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Beaker className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Tidak ada bahan baku ditemukan</p>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium text-sm">
                      {material.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <StockBadge stock={material.stock} unit={material.unit} />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                          onClick={() => handleEdit(material)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          onClick={() => requestDelete(material)}
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

      {/* ---- Form Dialog ---- */}
      <MaterialFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingMaterial(null);
        }}
        material={editingMaterial}
        onSave={handleSave}
      />

      {/* ---- Delete Confirmation ---- */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {cantDeleteReason ? "Tidak Dapat Menghapus" : "Hapus Bahan Baku?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cantDeleteReason ? (
                <span className="text-red-600">{cantDeleteReason}</span>
              ) : (
                <>
                  Apakah Anda yakin ingin menghapus{" "}
                  <span className="font-semibold text-foreground">
                    {deleteTarget?.name}
                  </span>
                  ? Tindakan ini tidak dapat dibatalkan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            {!cantDeleteReason && (
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
