import React, { useState } from 'react';
import {
  User,
  Camera,
  Calendar,
  Clock,
  Save,
  CheckCircle,
  Wallet,
  Target,
  ShoppingBag,
  BookOpen,
  ShieldAlert,
  BarChart2
} from 'lucide-react';

export default function ProfileTab({ currentUser, data, updateData }) {
  const [username, setUsername] = useState(data?.username || currentUser?.email?.split('@')[0] || 'hizby jr');
  const [fullName, setFullName] = useState(data?.fullName || "Hizby Fauzan 'Aisyi");
  const [birthDate, setBirthDate] = useState(data?.birthDate || '2009-10-05');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Handle upload foto dari komputer/HP
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar! Maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateData((prev) => ({
        ...prev,
        avatarUrl: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateData((prev) => ({
      ...prev,
      username: username.trim(),
      fullName: fullName.trim(),
      birthDate: birthDate
    }));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Ringkasan Statistik Data
  const txCount = (data?.finance?.transactions || []).length;
  const savingsCount = (data?.finance?.savingsGoals || []).length;
  const salesCount = (data?.planner?.sales || []).length;
  const eventsCount = (data?.planner?.events || []).length + (data?.planner?.study || []).length;
  const kedisCount = (data?.kedis?.violations || []).length;

  const headerUsername = username || 'hizby jr';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. HEADER BANNER CARD PROFIL */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          
          {/* AVATAR PROFIL (LOGIKAL KAMERA DI ATAS TEKS EDIT FOTO, TANPA LOGO DI POJOK KANAN) */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden group shadow-xl border-2 border-indigo-500/30 bg-slate-950 flex-shrink-0">
            {data?.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-indigo-400 font-black text-2xl uppercase">
                {headerUsername.charAt(0)}
              </div>
            )}

            {/* OVERLAY EDIT FOTO PRESISI DI TENGAH (IKON KAMERA DI ATAS TULISAN "EDIT FOTO") */}
            <label className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center space-y-1.5 text-white z-10">
              <Camera className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] font-bold text-slate-100 tracking-tight leading-none text-center">
                Edit Foto
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* DETAIL INFORMASI AKUN HEADER */}
          <div>
            <h2 className="text-xl font-extrabold text-white capitalize">{headerUsername}</h2>
            <p className="text-xs text-slate-400">Pemilik Akun Master Dashboard Personal</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center space-x-1.5 font-medium">
                <Calendar className="w-3 h-3 text-indigo-400" />
                <span>Dibuat: <strong>15 Oktober 2026</strong></span>
              </span>
              <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center space-x-1.5 font-medium">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>Login: <strong>16 Oktober 2026 pukul 09.40</strong></span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FORM PENGATURAN AKUN SAYA */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800">
          <User className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm md:text-base text-white">Pengaturan Akun Saya</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition mt-1.5"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Username menentukan nama yang muncul di header dashboard.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Nama</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition mt-1.5"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Tanggal Lahir</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition mt-1.5"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Email</label>
            <input
              type="email"
              disabled
              value={currentUser?.email || 'aisyi.hizby@gmail.com'}
              className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 cursor-not-allowed mt-1.5"
            />
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Profil berhasil disimpan!</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center space-x-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. STATISTIK & RINGKASAN DATA KAMU */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center space-x-2.5 pb-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm md:text-base text-white">Statistik & Ringkasan Data Kamu</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
            <Wallet className="w-4 h-4 text-indigo-400 mx-auto" />
            <div className="text-lg font-bold text-white">{txCount}</div>
            <div className="text-[10px] text-slate-400 font-medium">Transaksi Keuangan</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
            <Target className="w-4 h-4 text-emerald-400 mx-auto" />
            <div className="text-lg font-bold text-white">{savingsCount}</div>
            <div className="text-[10px] text-slate-400 font-medium">Target Nabung</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
            <ShoppingBag className="w-4 h-4 text-amber-400 mx-auto" />
            <div className="text-lg font-bold text-white">{salesCount}</div>
            <div className="text-[10px] text-slate-400 font-medium">Produk Jualan</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
            <BookOpen className="w-4 h-4 text-sky-400 mx-auto" />
            <div className="text-lg font-bold text-white">{eventsCount}</div>
            <div className="text-[10px] text-slate-400 font-medium">Agenda & Tugas</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2 col-span-2 md:col-span-1">
            <ShieldAlert className="w-4 h-4 text-rose-400 mx-auto" />
            <div className="text-lg font-bold text-white">{kedisCount}</div>
            <div className="text-[10px] text-slate-400 font-medium">Catatan Kedis OSIS</div>
          </div>
        </div>
      </div>
    </div>
  );
}