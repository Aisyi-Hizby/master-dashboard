import React from 'react';
import {
  Wallet,
  Settings,
  HelpCircle,
  Target,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

export default function FinanceTab({
  financeData,
  cashStats,
  ewalletStats,
  todayExpense,
  wishlistPrice,
  setWishlistPrice,
  formatRupiah,
  handleDeleteTransaction,
  handleDeleteSavingsGoal,
  setModalOpen,
  setNewLimitInput
}) {
  return (
    <div className="space-y-6">
      {/* WARNING KUOTA JAJAN */}
      {todayExpense >= (financeData.dailyLimit || 20000) && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex items-center space-x-3 text-amber-300">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Peringatan Kuota Jajan Harian!</p>
            <p>
              Pengeluaran hari ini ({formatRupiah(todayExpense)}) sudah melebihi limit harian (
              {formatRupiah(financeData.dailyLimit)}). Waktunya Berhenti jajan!
            </p>
          </div>
        </div>
      )}

      {/* DOMPET CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">Saldo Cash (Tunai)</span>
              <button
                onClick={() => {
                  setNewLimitInput(financeData.dailyLimit);
                  setModalOpen('editLimit');
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg text-xs flex items-center space-x-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="text-[10px]">Edit Limit</span>
              </button>
            </div>
            <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">{formatRupiah(cashStats.balance)}</h3>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Batas Jajan Harian: <b className="text-slate-300">{formatRupiah(financeData.dailyLimit)}</b>
          </p>
        </div>

        <div className="bg-slate-900 border border-purple-500/30 p-5 rounded-2xl relative bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40">
          <div className="flex justify-between items-center">
            <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Total Saldo E-Wallet</span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-md border border-purple-500/30">
              E-WALLET
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-purple-300 mt-1">{formatRupiah(ewalletStats.balance)}</h3>
          
          <div className="mt-3 pt-2 border-t border-purple-500/20 text-[11px] space-y-1">
            <div className="flex justify-between items-center text-emerald-400">
              <span>Pemasukan:</span>
              <span className="font-bold">+{formatRupiah(ewalletStats.income)}</span>
            </div>
            <div className="flex justify-between items-center text-rose-400">
              <span>Pengeluaran:</span>
              <span className="font-bold">-{formatRupiah(ewalletStats.expense)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>WISHLIST EVALUATOR</span>
          </h4>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Harga Barang Impian (Rp)"
              value={wishlistPrice}
              onChange={(e) => setWishlistPrice(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs md:text-sm w-full focus:outline-none focus:border-indigo-500 text-white"
            />
            <div className="text-xs text-slate-300 bg-indigo-950/60 border border-indigo-800/50 px-3 py-2 rounded-xl text-center">
              {wishlistPrice && Number(wishlistPrice) > 0 ? (
                <span>
                  Setara dengan <b className="text-indigo-400">{Math.ceil(Number(wishlistPrice) / (financeData.dailyLimit || 1))} Hari</b> uang jajan
                </span>
              ) : (
                'Masukkan nominal barang untuk mengevaluasi'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SAVINGS GOALS */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Target Nabung (Savings Goals)</span>
          </h3>
          <button
            onClick={() => setModalOpen('savings')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Target</span>
          </button>
        </div>

        <div className="space-y-4">
          {financeData.savingsGoals.map((g) => {
            const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            return (
              <div key={g.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="font-bold text-slate-200">{g.title}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-indigo-400 font-semibold">{percent}%</span>
                    <button onClick={() => handleDeleteSavingsGoal(g.id)} className="text-slate-500 hover:text-red-400 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Terkumpul: {formatRupiah(g.currentAmount)} / {formatRupiah(g.targetAmount)}</span>
                  <span>Deadline: {g.deadline}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIWAYAT TRANSAKSI */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm text-slate-200">Riwayat Transaksi</h3>
          <button
            onClick={() => setModalOpen('tx')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Transaksi</span>
          </button>
        </div>

        <div className="space-y-2">
          {financeData.transactions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Belum ada riwayat transaksi.</p>
          ) : (
            financeData.transactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs md:text-sm">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-slate-200">{t.note}</p>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        t.account === 'ewallet' || t.account === 'ovo'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.account === 'ewallet' || t.account === 'ovo' ? 'E-WALLET' : 'CASH'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{t.category} • {t.date}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                  </span>
                  <button onClick={() => handleDeleteTransaction(t.id)} className="text-slate-600 hover:text-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}