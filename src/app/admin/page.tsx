"use client";

import { Package, Beaker, ArrowRight, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminIndexPage() {
  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <div className="text-center mb-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 mb-6">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Panel Admin</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Kelola produk, resep, dan ketersediaan bahan baku dalam satu tempat
          terpusat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Manajemen Produk */}
        <Link
          href="/admin/products"
          className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-orange-500/50"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 transition-colors group-hover:bg-orange-500/20">
              <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                Manajemen Produk
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ubah nama, harga, dan tetapkan resep pada setiap produk menu
                yang dijual.
              </p>
              <div className="flex items-center text-sm font-semibold text-orange-600 dark:text-orange-400">
                Kelola Produk{" "}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </Link>

        {/* Manajemen Bahan Baku */}
        <Link
          href="/admin/materials"
          className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-amber-500/50"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
              <Beaker className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Manajemen Bahan Baku
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Atur ketersediaan stok, daftarkan bahan baru, dan konfigurasi
                satuan ukuran.
              </p>
              <div className="flex items-center text-sm font-semibold text-amber-600 dark:text-amber-400">
                Kelola Bahan Baku{" "}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
