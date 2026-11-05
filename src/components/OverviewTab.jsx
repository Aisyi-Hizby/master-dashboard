import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  ShoppingBag,
  Plus,
  TrendingUp,
  Calendar,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Flame,
  Clock,
  Sparkles,
  Target,
  BarChart2
} from 'lucide-react';

export default function OverviewTab({
  currentUser,
  data,
  totalAllBalance,
  cashStats,
  ewalletStats,
  salesData,
  eventsData,
  habitCompletionRate,
  violationsCount,
  formatRupiah,
  setModalOpen,
  handleToggleHabit
}) {
  const username = data?.username || currentUser?.email?.split('@')[0] || 'Pengguna';

  // 1. UCAPAN WAKTU REAL-TIME & TANGGAL
  const [greeting, setGreeting] = useState('Selamat Pagi');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 5 && hour < 11) setGreeting('Selamat Pagi');
      else if (hour >= 11 && hour < 15) setGreeting('Selamat Siang');
      else if (hour >= 15 && hour < 18) setGreeting('Selamat Sore');
      else setGreeting('Selamat Malam');

      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      setCurrentDateStr(now.toLocaleDateString('id-ID', options));
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. GRAFIK KEUANGAN (BERURUTAN DARI SENIN - MINGGU)
  const currentWeekData = useMemo(() => {
    const result = [];
    const txs = data?.finance?.transactions || [];

    // Cari tanggal hari Senin pada minggu ini
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Minggu, 1 = Senin, dst.
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    // Loop 7 hari dari Senin (i=0) hingga Minggu (i=6)
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Ambil nama hari singkat Bahasa Indonesia
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });

      const dayExpense = txs
        .filter((t) => t.date === dateStr && t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const dayIncome = txs
        .filter((t) => t.date === dateStr && t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      result.push({
        dateStr,
        dayLabel,
        expense: dayExpense,
        income: dayIncome
      });
    }
    return result;
  }, [data?.finance?.transactions]);

  const maxChartVal = useMemo(() => {
    const max = Math.max(
      ...currentWeekData.map((d) => Math.max(d.expense, d.income)),
      50000
    );
    return max;
  }, [currentWeekData]);

  // 3. COUNTDOWN EVENT TERDEKAT
  const nearestEvent = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = (data?.planner?.events || [])
      .map((ev) => {
        const evDate = new Date(ev.date);
        evDate.setHours(0, 0, 0, 0);
        const diffTime = evDate - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...ev, daysLeft };
      })
      .filter((ev) => ev.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return upcoming[0] || null;
  }, [data?.planner?.events]);

  const habitsList = data?.planner?.habits || [];

  return (
    <div className="space-y-6">
      {/* BANNER UCAPAN WAKTU & TANGGAL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
              DASHBOARD UTAMA
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>{currentDateStr}</span>
            </span>
          </div>

          <h2 className="text-2xl font-black text-white">
            {greeting}, <span className="text-indigo-400">{username}</span> ! 
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Pantau saldo keuangan, kebiasaan harian, target penjualan, serta catatan kedisiplinan siswa SMK secara real-time.
          </p>
        </div>

        {/* COUNTDOWN CARD */}
        {nearestEvent ? (
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-3.5 flex items-center space-x-3.5 z-10 min-w-[210px] shadow-lg">
            <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-500/30 flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                Agenda Mendatang
              </span>
              <p className="text-xs font-bold text-white truncate max-w-[140px]">{nearestEvent.title}</p>
              <p className="text-[11px] font-semibold text-emerald-400">
                {nearestEvent.daysLeft === 0
                  ? ' Hari Ini!'
                  : `⏳ ${nearestEvent.daysLeft} Hari Lagi`}
              </p>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex bg-slate-950/60 border border-slate-800 rounded-xl p-3 items-center space-x-2 text-xs text-slate-400">
            <Target className="w-4 h-4 text-slate-500" />
            <span>1% Better Every Day!</span>
          </div>
        )}
      </div>

      {/* CARDS RINGKASAN SALDO & AKTIVITAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TOTAL SALDO */}
        <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Saldo Kamu</p>
              <h3 className="text-2xl font-black text-white mt-1">{formatRupiah(totalAllBalance)}</h3>
            </div>
            <div className="p-2 bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-[11px]">
            <span className="text-slate-400">Cash: <strong className="text-slate-200">{formatRupiah(cashStats.balance)}</strong></span>
            <span className="text-slate-400">E-Wallet: <strong className="text-slate-200">{formatRupiah(ewalletStats.balance)}</strong></span>
          </div>
        </div>

        {/* TARGET JUALAN AKTIF */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Target Jualan Aktif</p>
              <h3 className="text-2xl font-black text-white mt-1">{salesData.length} Produk</h3>
            </div>
            <div className="p-2 bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">Kelola produk & simpan profit ke target tabungan</p>
        </div>

        {/* PROGRESS KEBIASAAN */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Progress Kebiasaan</p>
              <h3 className="text-2xl font-black text-white mt-1">{habitCompletionRate}%</h3>
            </div>
            <div className="p-2 bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-4 overflow-hidden border border-slate-800">
            <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${habitCompletionRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* BARIS KEDUA: GRAFIK KEUANGAN (SENIN - MINGGU) & HABIT CHECKLIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* GRAFIK KEUANGAN MINGGU INI */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Statistik Keuangan Minggu Ini
              </h4>
            </div>
            <div className="flex items-center space-x-3 text-[10px]">
              <span className="flex items-center space-x-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Keluar</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Masuk</span>
              </span>
            </div>
          </div>

          <div className="h-36 flex items-end justify-between pt-4 px-2 space-x-2">
            {currentWeekData.map((item, idx) => {
              const expHeightPercent = Math.min(100, Math.round((item.expense / maxChartVal) * 100));
              const incHeightPercent = Math.min(100, Math.round((item.income / maxChartVal) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex justify-center items-end space-x-1 h-28 border-b border-slate-800 pb-1">
                    {/* BAR PENGELUARAN */}
                    <div
                      style={{ height: `${Math.max(item.expense > 0 ? 8 : 2, expHeightPercent)}%` }}
                      className={`w-2.5 rounded-t transition-all ${
                        item.expense > 0 ? 'bg-rose-500 group-hover:bg-rose-400' : 'bg-slate-800'
                      }`}
                      title={`${item.dayLabel}: Keluar ${formatRupiah(item.expense)}`}
                    ></div>
                    {/* BAR PEMASUKAN */}
                    <div
                      style={{ height: `${Math.max(item.income > 0 ? 8 : 2, incHeightPercent)}%` }}
                      className={`w-2.5 rounded-t transition-all ${
                        item.income > 0 ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-slate-800'
                      }`}
                      title={`${item.dayLabel}: Masuk ${formatRupiah(item.income)}`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-1.5">{item.dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* WIDGET CHECKLIST KEBIASAAN HARI INI */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Habit Hari Ini
              </h4>
            </div>
            <button
              onClick={() => setModalOpen('habit')}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah</span>
            </button>
          </div>

          {habitsList.length === 0 ? (
            <div className="my-auto py-6 text-center space-y-2">
              <p className="text-xs text-slate-500">Belum ada kebiasaan yang dicatat.</p>
              <button
                onClick={() => setModalOpen('habit')}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                + Buat Kebiasaan Baru
              </button>
            </div>
          ) : (
            <div className="space-y-2 my-auto">
              {habitsList.slice(0, 4).map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => handleToggleHabit && handleToggleHabit(habit.id)}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    habit.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-300'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {habit.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${habit.completed ? 'line-through text-slate-400' : ''}`}>
                      {habit.title}
                    </span>
                  </div>
                  {habit.streak > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                      <Flame className="w-2.5 h-2.5" />
                      <span>{habit.streak}d</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BARIS KETIGA: PINTASAN UTAMA & AGENDA TERDEKAT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* PINTASAN UTAMA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Pintasan Utama</h4>
            <span className="text-[10px] text-slate-500">Shortcut</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* CATAT TRANSAKSI */}
            <button
              onClick={() => setModalOpen('tx')}
              className="p-3.5 bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-left transition group relative overflow-hidden flex flex-col justify-between space-y-2 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:scale-105 transition-transform">
                  <Wallet className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  Catat Transaksi
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Pemasukan & jajan</p>
              </div>
            </button>

            {/* TAMBAH JUALAN */}
            <button
              onClick={() => setModalOpen('sales')}
              className="p-3.5 bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition group relative overflow-hidden flex flex-col justify-between space-y-2 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  Tambah Jualan
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Produk jualan harian</p>
              </div>
            </button>

            {/* TAMBAH AGENDA */}
            <button
              onClick={() => setModalOpen('event')}
              className="p-3.5 bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 rounded-xl text-left transition group relative overflow-hidden flex flex-col justify-between space-y-2 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                  Tambah Agenda
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Jadwal & kegiatan</p>
              </div>
            </button>

            {/* CATAT KEDIS */}
            <button
              onClick={() => setModalOpen('kedis')}
              className="p-3.5 bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/40 rounded-xl text-left transition group relative overflow-hidden flex flex-col justify-between space-y-2 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-400 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
                  Catat Kedis
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Pelanggaran siswa</p>
              </div>
            </button>
          </div>
        </div>

        {/* AGENDA TERDEKAT LIST */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Agenda Terdekat</h4>
            <span className="text-[10px] text-slate-500">{eventsData.length} Agenda</span>
          </div>

          {eventsData.length === 0 ? (
            <div className="my-auto py-8 text-center">
              <p className="text-xs text-slate-500">Belum ada agenda tersimpan</p>
            </div>
          ) : (
            <div className="space-y-2 my-auto">
              {eventsData.slice(0, 3).map((ev) => (
                <div key={ev.id} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-slate-200">{ev.title}</p>
                    <p className="text-[10px] text-slate-400">{ev.category} • {ev.date}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Agenda
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}