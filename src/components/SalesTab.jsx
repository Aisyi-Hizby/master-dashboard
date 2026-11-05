import React from 'react';
import {
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Scale,
  Plus,
  Trash2,
  Wallet
} from 'lucide-react';

export default function SalesTab({
  salesData,
  salesSummary,
  formatRupiah,
  setData,
  handleDeleteSales,
  handleTransferProfitToSavings,
  setModalOpen
}) {
  return (
    <div className="space-y-6">
      {/* SUMMARY PERFORMANCE */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>Rekap Keuangan & Performa Penjualan</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Analisis omset, modal, serta indikator Surplus / Defisit hasil jualan</p>
          </div>
          
          <div className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 border shadow-lg ${
            salesSummary.netProfit > 0
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
              : salesSummary.netProfit < 0
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-rose-500/10'
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            {salesSummary.netProfit > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>STATUS: SURPLUS (+{formatRupiah(salesSummary.netProfit)})</span>
              </>
            ) : salesSummary.netProfit < 0 ? (
              <>
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>STATUS: MINUS ({formatRupiah(salesSummary.netProfit)})</span>
              </>
            ) : (
              <>
                <Scale className="w-4 h-4 text-slate-400" />
                <span>STATUS: IMPAS (Rp0)</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-slate-400 font-medium">Total Omset</span>
            <p className="text-lg font-black text-emerald-400 mt-1">{formatRupiah(salesSummary.totalRevenue)}</p>
            <span className="text-[10px] text-slate-500">Total uang masuk barang laku</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-slate-400 font-medium">Total Modal Terpakai</span>
            <p className="text-lg font-black text-amber-400 mt-1">{formatRupiah(salesSummary.totalCostSold)}</p>
            <span className="text-[10px] text-slate-500">Modal dari barang terjual</span>
          </div>

          <div className={`bg-slate-950 border p-3.5 rounded-xl ${
            salesSummary.netProfit > 0 ? 'border-emerald-500/30' : salesSummary.netProfit < 0 ? 'border-rose-500/30' : 'border-slate-800'
          }`}>
            <span className="text-[11px] text-slate-400 font-medium">Laba / Rugi Bersih</span>
            <p className={`text-lg font-black mt-1 ${
              salesSummary.netProfit > 0 ? 'text-emerald-300' : salesSummary.netProfit < 0 ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {salesSummary.netProfit > 0 ? `+${formatRupiah(salesSummary.netProfit)}` : formatRupiah(salesSummary.netProfit)}
            </p>
            <span className="text-[10px] text-slate-500">
              {salesSummary.netProfit > 0 ? ' Untung Bersih' : salesSummary.netProfit < 0 ? '⚠️ Defisit / Rugi' : 'Impas'}
            </span>
          </div>
        </div>
      </div>

      {/* DAFTAR PRODUK JUALAN */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Target Jualan & Lapak Sekolah</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Kelola kuantitas laku dan lihat profit tiap barang</p>
          </div>
          <button
            onClick={() => setModalOpen('sales')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produk</span>
          </button>
        </div>

        <div className="space-y-3">
          {salesData.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-xl">
              Belum ada produk jualan ditambahkan.
            </p>
          ) : (
            salesData.map((s) => {
              const sold = Number(s.soldQty) || 0;
              const price = Number(s.sellPrice) || 0;
              const cost = Number(s.costPrice) || 0;
              const omsetProduct = sold * price;
              const costProduct = sold * cost;
              const itemProfit = omsetProduct - costProduct;

              return (
                <div key={s.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{s.item}</h4>
                      <span className="text-[10px] text-slate-400">
                        Modal: {formatRupiah(cost)} /pcs | Jual: {formatRupiah(price)} /pcs
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        itemProfit > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : itemProfit < 0
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {itemProfit > 0 ? `Surplus: +${formatRupiah(itemProfit)}` : itemProfit < 0 ? `Defisit: ${formatRupiah(itemProfit)}` : 'Rp0'}
                      </span>
                      <button onClick={() => handleDeleteSales(s.id)} className="text-slate-500 hover:text-red-400 p-1 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-400 font-medium">Realisasi Laku:</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            const newQty = Math.max(0, sold - 1);
                            setData((prev) => ({
                              ...prev,
                              planner: {
                                ...prev.planner,
                                sales: prev.planner.sales.map((item) => (item.id === s.id ? { ...item, soldQty: newQty } : item))
                              }
                            }));
                          }}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={s.soldQty}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setData((prev) => ({
                              ...prev,
                              planner: {
                                ...prev.planner,
                                sales: prev.planner.sales.map((item) => (item.id === s.id ? { ...item, soldQty: val } : item))
                              }
                            }));
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-md px-2 py-0.5 w-14 text-center text-white focus:outline-none focus:border-emerald-500 font-bold"
                        />
                        <button
                          onClick={() => {
                            const newQty = sold + 1;
                            setData((prev) => ({
                              ...prev,
                              planner: {
                                ...prev.planner,
                                sales: prev.planner.sales.map((item) => (item.id === s.id ? { ...item, soldQty: newQty } : item))
                              }
                            }));
                          }}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-slate-400">/ {s.targetQty} pcs</span>
                    </div>

                    <div className="text-[11px] text-slate-300">
                      Omset Produk: <b className="text-emerald-400">{formatRupiah(omsetProduct)}</b>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTransferProfitToSavings(s)}
                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs py-2 rounded-lg font-medium transition flex items-center justify-center space-x-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Transfer Profit ke Target Nabung</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}