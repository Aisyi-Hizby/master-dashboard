import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import Auth from './Auth';

// IMPORT KOMPONEN TAB MODULAR
import OverviewTab from './components/OverviewTab';
import FinanceTab from './components/FinanceTab';
import SalesTab from './components/SalesTab';
import StudyTab from './components/StudyTab';
import KedisTab from './components/KedisTab';
import ProfileTab from './components/ProfileTab';

import {
  ShieldAlert,
  Wallet,
  Banknote,
  Eye,
  EyeOff,
  BookOpen,
  ShoppingBag,
  LogOut,
  X,
  Settings,
  Target,
  Flame,
  Share2,
  Calendar as CalendarIcon,
  Loader2,
  User,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  FileText,
  PlusCircle,
  Calendar,
  GraduationCap
} from 'lucide-react';

// HELPER FORMAT TANGGAL HARIAN (YYYY-MM-DD)
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_DATA = {
  finance: {
    balance: 0,
    dailyLimit: 20000,
    transactions: [],
    savingsGoals: []
  },
  planner: {
    sales: [],
    habits: [
      { id: '1', title: 'Bangun Jam 05.00', completed: false, streak: 0, lastResetDate: getTodayString() },
      { id: '2', title: 'Olahraga 15 Menit', completed: false, streak: 0, lastResetDate: getTodayString() }
    ],
    study: [],
    events: []
  },
  kedis: {
    violations: []
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [data, setData] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('overview');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(null);

  // STATE DROPDOWN PROFIL
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Helper menyimpan data ke State, Firestore, & LocalStorage
  const updateData = (updater) => {
    setData((prevData) => {
      const newData = typeof updater === 'function' ? updater(prevData) : updater;
      if (currentUser?.uid) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        setDoc(userDocRef, newData, { merge: true }).catch((err) =>
          console.error('Gagal menyimpan ke Firestore:', err)
        );
        localStorage.setItem(`master_dashboard_${currentUser.uid}`, JSON.stringify(newData));
      }
      return newData;
    });
  };

  // 1. Monitor status Auth login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Baca data dari Firestore berdasarkan UID
  useEffect(() => {
    if (!currentUser?.uid) {
      setData(INITIAL_DATA);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    const userDocRef = doc(db, 'users', currentUser.uid);

    const unsubscribeDoc = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          setDoc(userDocRef, INITIAL_DATA);
          setData(INITIAL_DATA);
        }
        setLoadingData(false);
      },
      (error) => {
        console.error('Gagal mengambil data dari Firestore:', error);
        const userLocalKey = `master_dashboard_${currentUser.uid}`;
        const saved = localStorage.getItem(userLocalKey);
        if (saved) {
          setData(JSON.parse(saved));
        } else {
          setData(INITIAL_DATA);
        }
        setLoadingData(false);
      }
    );

    return () => unsubscribeDoc();
  }, [currentUser?.uid]);

  // 3. AUTO-RESET HABIT HARIAN (JAM 00.00)
  useEffect(() => {
    if (!data?.planner?.habits || data.planner.habits.length === 0) return;

    const today = getTodayString();
    let needsUpdate = false;

    const updatedHabits = data.planner.habits.map((habit) => {
      if (habit.lastResetDate !== today) {
        needsUpdate = true;
        return {
          ...habit,
          completed: false, // Reset status centang
          lastResetDate: today
        };
      }
      return habit;
    });

    if (needsUpdate) {
      updateData((prev) => ({
        ...prev,
        planner: {
          ...prev.planner,
          habits: updatedHabits
        }
      }));
    }
  }, [data?.planner?.habits]);

  // Form States
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getTodayString());
  const [eventForm, setEventForm] = useState({ title: '', date: getTodayString(), category: 'Sekolah', note: '' });
  const [kedisForm, setKedisForm] = useState({ studentName: '', class: '', type: 'Terlambat Masuk Sekolah', dayOccurred: 'Senin', note: '' });
  const [kedisSearch, setKedisSearch] = useState('');
  const [filterBandel, setFilterBandel] = useState(false);
  const [selectedWaDraft, setSelectedWaDraft] = useState(null);

  const [finForm, setFinForm] = useState({
    type: 'expense',
    amount: '',
    category: 'Makan',
    note: '',
    account: 'cash',
    date: getTodayString()
  });
  const [wishlistPrice, setWishlistPrice] = useState('');
  const [savingsForm, setSavingsForm] = useState({ title: '', targetAmount: '', deadline: '' });
  const [newLimitInput, setNewLimitInput] = useState(data?.finance?.dailyLimit || 20000);

  const [salesForm, setSalesForm] = useState({ item: '', targetQty: '', costPrice: '', sellPrice: '' });
  const [studyForm, setStudyForm] = useState({ subject: '', topic: '', deadline: '' });
  const [habitTitleInput, setHabitTitleInput] = useState('');

  // Pomodoro Timer
  const [pomoInitialTime, setPomoInitialTime] = useState(25 * 60);
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);

  useEffect(() => {
    let timer = null;
    if (pomoRunning && pomoTime > 0) {
      timer = setInterval(() => setPomoTime((prev) => prev - 1), 1000);
    } else if (pomoTime === 0 && pomoRunning) {
      setPomoRunning(false);
      alert('⏰ Sesi Fokus Pomodoro Selesai!');
    }
    return () => clearInterval(timer);
  }, [pomoRunning, pomoTime]);

  const handleAdjustPomo = (minutes) => {
    if (pomoRunning) return;
    const newTime = Math.max(60, Math.min(180 * 60, pomoInitialTime + minutes * 60));
    setPomoInitialTime(newTime);
    setPomoTime(newTime);
  };

  const handleSetPomoPreset = (minutes) => {
    if (pomoRunning) return;
    const newTime = minutes * 60;
    setPomoInitialTime(newTime);
    setPomoTime(newTime);
  };

  const handleLogout = () => signOut(auth);

  // Calculations
  const cashStats = useMemo(() => {
    const txs = (data?.finance?.transactions || []).filter((t) => (t.account || 'cash') === 'cash');
    const income = txs.filter((t) => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = txs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    return { balance: income - expense, income, expense };
  }, [data?.finance?.transactions]);

  const ewalletStats = useMemo(() => {
    const txs = (data?.finance?.transactions || []).filter((t) => t.account === 'ewallet' || t.account === 'ovo');
    const income = txs.filter((t) => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = txs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    return { balance: income - expense, income, expense };
  }, [data?.finance?.transactions]);

  const totalAllBalance = cashStats.balance + ewalletStats.balance;

  const salesSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalCostSold = 0;
    (data?.planner?.sales || []).forEach((s) => {
      const sold = Number(s.soldQty) || 0;
      const cost = Number(s.costPrice) || 0;
      const price = Number(s.sellPrice) || 0;
      totalRevenue += sold * price;
      totalCostSold += sold * cost;
    });
    return { totalRevenue, totalCostSold, netProfit: totalRevenue - totalCostSold };
  }, [data?.planner?.sales]);

  const todayExpense = useMemo(() => {
    const today = getTodayString();
    return (data?.finance?.transactions || [])
      .filter((t) => t.type === 'expense' && t.date === today)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [data?.finance?.transactions]);

  const habitCompletionRate = useMemo(() => {
    if (!data?.planner?.habits?.length) return 0;
    const completed = data.planner.habits.filter((h) => h.completed).length;
    return Math.round((completed / data.planner.habits.length) * 100);
  }, [data?.planner?.habits]);

  const formatRupiah = (num) => {
    if (privacyMode) return '••••••••';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
  };

  // Action Handlers
  const handleSaveDailyLimit = (e) => {
    e.preventDefault();
    if (Number(newLimitInput) <= 0) return;
    updateData((prev) => ({ ...prev, finance: { ...prev.finance, dailyLimit: Number(newLimitInput) } }));
    setModalOpen(null);
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!finForm.amount) return;
    const newTx = {
      id: Date.now().toString(),
      type: finForm.type,
      amount: Number(finForm.amount),
      category: finForm.category,
      note: finForm.note,
      account: finForm.account || 'cash',
      date: finForm.date || getTodayString()
    };
    updateData((prev) => ({
      ...prev,
      finance: { ...prev.finance, transactions: [newTx, ...(prev.finance?.transactions || [])] }
    }));
    setFinForm({ type: 'expense', amount: '', category: 'Makan', note: '', account: 'cash', date: getTodayString() });
    setModalOpen(null);
  };

  const handleDeleteTransaction = (id) => {
    updateData((prev) => ({
      ...prev,
      finance: { ...prev.finance, transactions: (prev.finance?.transactions || []).filter((t) => t.id !== id) }
    }));
  };

  const handleAddSavingsGoal = (e) => {
    e.preventDefault();
    if (!savingsForm.title || !savingsForm.targetAmount) return;
    const newGoal = {
      id: Date.now().toString(),
      title: savingsForm.title,
      targetAmount: Number(savingsForm.targetAmount),
      currentAmount: 0,
      deadline: savingsForm.deadline || '2026-12-31'
    };
    updateData((prev) => ({
      ...prev,
      finance: { ...prev.finance, savingsGoals: [...(prev.finance?.savingsGoals || []), newGoal] }
    }));
    setSavingsForm({ title: '', targetAmount: '', deadline: '' });
    setModalOpen(null);
  };

  const handleDeleteSavingsGoal = (id) => {
    updateData((prev) => ({
      ...prev,
      finance: { ...prev.finance, savingsGoals: (prev.finance?.savingsGoals || []).filter((g) => g.id !== id) }
    }));
  };

  const handleAddKedis = (e) => {
    e.preventDefault();
    if (!kedisForm.studentName || !kedisForm.class) return;
    const newViolation = {
      id: Date.now().toString(),
      studentName: kedisForm.studentName,
      class: kedisForm.class,
      type: kedisForm.type,
      note: kedisForm.note,
      dayOccurred: kedisForm.dayOccurred,
      status: 'Belum Selesai',
      date: getTodayString()
    };
    updateData((prev) => ({
      ...prev,
      kedis: { ...prev.kedis, violations: [newViolation, ...(prev.kedis?.violations || [])] }
    }));
    setKedisForm({ studentName: '', class: '', type: 'Terlambat Masuk Sekolah', dayOccurred: 'Senin', note: '' });
    setModalOpen(null);
  };

  const handleDeleteKedis = (id) => {
    updateData((prev) => ({
      ...prev,
      kedis: { ...prev.kedis, violations: (prev.kedis?.violations || []).filter((v) => v.id !== id) }
    }));
  };

  const handleToggleKedisStatus = (id) => {
    updateData((prev) => ({
      ...prev,
      kedis: {
        ...prev.kedis,
        violations: (prev.kedis?.violations || []).map((v) =>
          v.id === id ? { ...v, status: v.status === 'Selesai' ? 'Belum Selesai' : 'Selesai' } : v
        )
      }
    }));
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) return;
    const newEv = {
      id: Date.now().toString(),
      title: eventForm.title,
      date: eventForm.date,
      category: eventForm.category,
      note: eventForm.note
    };
    updateData((prev) => ({
      ...prev,
      planner: { ...prev.planner, events: [...(prev.planner?.events || []), newEv] }
    }));
    setEventForm({ title: '', date: getTodayString(), category: 'Sekolah', note: '' });
    setModalOpen(null);
  };

  const handleDeleteEvent = (id) => {
    updateData((prev) => ({
      ...prev,
      planner: { ...prev.planner, events: (prev.planner?.events || []).filter((ev) => ev.id !== id) }
    }));
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!habitTitleInput.trim()) return;
    const newHabit = {
      id: Date.now().toString(),
      title: habitTitleInput.trim(),
      completed: false,
      streak: 0,
      lastResetDate: getTodayString()
    };
    updateData((prev) => ({
      ...prev,
      planner: { ...prev.planner, habits: [...(prev.planner?.habits || []), newHabit] }
    }));
    setHabitTitleInput('');
    setModalOpen(null);
  };

  const handleToggleHabit = (id) => {
    updateData((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        habits: (prev.planner?.habits || []).map((h) =>
          h.id === id
            ? {
                ...h,
                completed: !h.completed,
                streak: !h.completed ? h.streak + 1 : Math.max(0, h.streak - 1)
              }
            : h
        )
      }
    }));
  };

  const handleDeleteHabit = (id, e) => {
    e.stopPropagation();
    updateData((prev) => ({
      ...prev,
      planner: { ...prev.planner, habits: (prev.planner?.habits || []).filter((h) => h.id !== id) }
    }));
  };

  const handleAddSales = (e) => {
    e.preventDefault();
    if (!salesForm.item) return;
    const newItem = {
      id: Date.now().toString(),
      item: salesForm.item,
      targetQty: Number(salesForm.targetQty) || 10,
      soldQty: 0,
      costPrice: Number(salesForm.costPrice) || 0,
      sellPrice: Number(salesForm.sellPrice) || 0,
      date: getTodayString()
    };
    updateData((prev) => ({
      ...prev,
      planner: { ...prev.planner, sales: [newItem, ...(prev.planner?.sales || [])] }
    }));
    setSalesForm({ item: '', targetQty: '', costPrice: '', sellPrice: '' });
    setModalOpen(null);
  };

  const handleDeleteSales = (id) => {
    updateData((prev) => ({
      ...prev,
      planner: { ...prev.planner, sales: (prev.planner?.sales || []).filter((s) => s.id !== id) }
    }));
  };

  const handleAddStudyGoal = (e) => {
    e.preventDefault();
    if (!studyForm.subject || !studyForm.topic) return;
    const newStudy = {
      id: Date.now().toString(),
      subject: studyForm.subject,
      topic: studyForm.topic,
      deadline: studyForm.deadline || 'Besok',
      completed: false
    };
    updateData((prev) => ({
      ...prev,
      planner: { ...prev.planner, study: [...(prev.planner?.study || []), newStudy] }
    }));
    setStudyForm({ subject: '', topic: '', deadline: '' });
    setModalOpen(null);
  };

  const handleToggleStudy = (id) => {
    updateData((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        study: (prev.planner?.study || []).map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
      }
    }));
  };

  const handleDeleteStudy = (id) => {
    updateData((prev) => ({
      ...prev,
      planner: { ...prev.planner, study: (prev.planner?.study || []).filter((st) => st.id !== id) }
    }));
  };

  const handleTransferProfitToSavings = (sale) => {
    const profit = (sale.sellPrice - sale.costPrice) * sale.soldQty;
    if (profit <= 0) return alert('Belum ada profit yang dihasilkan!');

    if (!data.finance?.savingsGoals?.length) {
      return alert('Tambahkan minimal 1 Target Nabung terlebih dahulu di tab Keuangan!');
    }

    updateData((prev) => {
      const updatedGoals = prev.finance.savingsGoals.map((g, idx) =>
        idx === 0 ? { ...g, currentAmount: g.currentAmount + profit } : g
      );
      return { ...prev, finance: { ...prev.finance, savingsGoals: updatedGoals } };
    });
    alert(`Sukses! Profit ${formatRupiah(profit)} berhasil ditransfer ke Target Nabung!`);
  };

  const handleExportKedisText = () => {
    let report = `📋 *REKAPITULASI PELANGGARAN SISWA (KEDIS OSIS)*\nTanggal Export: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    (data?.kedis?.violations || []).forEach((v, index) => {
      report += `${index + 1}. *${v.studentName}* (${v.class})\nPelanggaran: ${v.type}\nHari Kejadian: ${v.dayOccurred} (${v.date})\nStatus: ${v.status}\nCatatan: ${v.note || '-'}\n\n`;
    });
    navigator.clipboard.writeText(report);
    alert('Rekapitulasi Kedis OSIS berhasil dicopy ke Clipboard!');
  };

  const filteredViolations = useMemo(() => {
    let list = [...(data?.kedis?.violations || [])];
    if (kedisSearch) {
      list = list.filter(
        (v) =>
          v.studentName.toLowerCase().includes(kedisSearch.toLowerCase()) ||
          v.class.toLowerCase().includes(kedisSearch.toLowerCase()) ||
          v.dayOccurred.toLowerCase().includes(kedisSearch.toLowerCase())
      );
    }
    if (filterBandel) {
      const counts = {};
      list.forEach((v) => (counts[v.studentName] = (counts[v.studentName] || 0) + 1));
      list.sort((a, b) => counts[b.studentName] - counts[a.studentName]);
    }
    return list;
  }, [data?.kedis?.violations, kedisSearch, filterBandel]);

  const sortedEvents = useMemo(() => {
    return [...(data?.planner?.events || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data?.planner?.events]);

  if (loadingAuth || (currentUser && loadingData)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 text-xs font-medium space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p>Memuat data akun kamu...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  const headerUsername = data?.username || currentUser.email.split('@')[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 md:pb-12 selection:bg-indigo-500 selection:text-white">
      {/* NAVBAR */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm md:text-base leading-tight">Master Dashboard</h1>
              <p className="text-[10px] md:text-xs text-slate-400">Personal Finance & Kedis OSIS</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full border transition ${
                privacyMode
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {privacyMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{privacyMode ? 'Privasi: ON' : 'Sembunyikan Saldo'}</span>
            </button>

            {/* AKUN / PROFIL DROPDOWN MENU */}
            <div className="relative pl-2 border-l border-slate-800">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition text-xs font-semibold ${
                  profileDropdownOpen || activeTab === 'profile'
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden">
                  {data?.avatarUrl ? (
                    <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    headerUsername.charAt(0)
                  )}
                </div>
                <span className="truncate max-w-[110px] md:max-w-[150px]">
                  {headerUsername}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>

                  <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-slate-800 hover:text-indigo-400 flex items-center space-x-2.5 transition font-medium"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Akun Saya</span>
                    </button>

                    <div className="my-1 border-t border-slate-800/80"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2.5 transition font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TAB MENU UTAMA */}
        <div className="max-w-5xl mx-auto flex justify-around mt-3 pt-2 border-t border-slate-800/80 text-xs md:text-sm font-medium overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'finance', label: 'Keuangan', icon: Wallet },
            { id: 'jualan', label: 'Penjualan', icon: ShoppingBag },
            { id: 'study', label: 'Belajar & Agenda', icon: BookOpen },
            { id: 'kedis', label: 'Kedis OSIS', icon: ShieldAlert }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 pb-2 px-2 md:px-4 border-b-2 transition flex-shrink-0 ${
                  active
                    ? tab.id === 'kedis'
                      ? 'border-red-500 text-red-400 font-bold'
                      : 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* RENDER TAB CONTENT */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            currentUser={currentUser}
            data={data}
            totalAllBalance={totalAllBalance}
            cashStats={cashStats}
            ewalletStats={ewalletStats}
            salesData={data?.planner?.sales || []}
            eventsData={data?.planner?.events || []}
            habitCompletionRate={habitCompletionRate}
            violationsCount={(data?.kedis?.violations || []).length}
            formatRupiah={formatRupiah}
            setModalOpen={setModalOpen}
            handleToggleHabit={handleToggleHabit}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceTab
            financeData={data?.finance || { balance: 0, dailyLimit: 20000, transactions: [], savingsGoals: [] }}
            cashStats={cashStats}
            ewalletStats={ewalletStats}
            todayExpense={todayExpense}
            formatRupiah={formatRupiah}
            setModalOpen={setModalOpen}
            handleDeleteTransaction={handleDeleteTransaction}
            handleDeleteSavingsGoal={handleDeleteSavingsGoal}
            setNewLimitInput={setNewLimitInput}
            wishlistPrice={wishlistPrice}
            setWishlistPrice={setWishlistPrice}
          />
        )}

        {activeTab === 'jualan' && (
          <SalesTab
            salesData={data?.planner?.sales || []}
            salesSummary={salesSummary}
            formatRupiah={formatRupiah}
            setModalOpen={setModalOpen}
            handleDeleteSales={handleDeleteSales}
            handleTransferProfitToSavings={handleTransferProfitToSavings}
            setData={updateData}
          />
        )}

        {activeTab === 'study' && (
          <StudyTab
            studyData={data?.planner?.study || []}
            habitsData={data?.planner?.habits || []}
            sortedEvents={sortedEvents}
            selectedCalendarDate={selectedCalendarDate}
            setSelectedCalendarDate={setSelectedCalendarDate}
            pomoTime={pomoTime}
            pomoInitialTime={pomoInitialTime}
            pomoRunning={pomoRunning}
            setPomoRunning={setPomoRunning}
            setPomoTime={setPomoTime}
            handleAdjustPomo={handleAdjustPomo}
            handleSetPomoPreset={handleSetPomoPreset}
            setModalOpen={setModalOpen}
            handleToggleHabit={handleToggleHabit}
            handleDeleteHabit={handleDeleteHabit}
            handleToggleStudy={handleToggleStudy}
            handleDeleteStudy={handleDeleteStudy}
            handleDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeTab === 'kedis' && (
          <KedisTab
            filteredViolations={filteredViolations}
            kedisSearch={kedisSearch}
            setKedisSearch={setKedisSearch}
            filterBandel={filterBandel}
            setFilterBandel={setFilterBandel}
            setModalOpen={setModalOpen}
            handleDeleteKedis={handleDeleteKedis}
            handleToggleKedisStatus={handleToggleKedisStatus}
            handleExportKedisText={handleExportKedisText}
            setSelectedWaDraft={setSelectedWaDraft}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab currentUser={currentUser} data={data} updateData={updateData} />
        )}
      </main>

      {/* MODALS */}
      {modalOpen === 'event' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setModalOpen(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Tambah Agenda Baru</h3>
                <p className="text-xs text-slate-400">Jadwalkan kegiatan sekolah atau pribadi</p>
              </div>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4 pt-1">
              <div>
                <label className="text-xs text-slate-400 font-medium">Judul Agenda / Kegiatan</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ujian Tengah Semester"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-sky-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Tanggal</label>
                  <div className="relative mt-1.5">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-sky-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Kategori</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 transition mt-1.5"
                  >
                    <option value="Sekolah">Sekolah</option>
                    <option value="Asrama">Asrama</option>
                    <option value="Pribadi">Pribadi</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Catatan / Detail Tambahan</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: Persiapkan dokumen"
                    value={eventForm.note}
                    onChange={(e) => setEventForm({ ...eventForm, note: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-sky-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg shadow-sky-600/20 mt-2">
                Simpan Agenda
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KEDIS OSIS */}
      {modalOpen === 'kedis' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setModalOpen(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Catat Pelanggaran Siswa</h3>
                <p className="text-xs text-slate-400">Pencatatan ketertiban & kedisiplinan OSIS</p>
              </div>
            </div>

            <form onSubmit={handleAddKedis} className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Nama Siswa</label>
                  <div className="relative mt-1.5">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap"
                      value={kedisForm.studentName}
                      onChange={(e) => setKedisForm({ ...kedisForm, studentName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-rose-500 transition placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium">Kelas</label>
                  <div className="relative mt-1.5">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <GraduationCap className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: X RPL 1"
                      value={kedisForm.class}
                      onChange={(e) => setKedisForm({ ...kedisForm, class: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-rose-500 transition placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Jenis Pelanggaran</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <ShieldAlert className="w-4 h-4 text-slate-500" />
                  </div>
                  <select
                    value={kedisForm.type}
                    onChange={(e) => setKedisForm({ ...kedisForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-8 text-xs text-white focus:outline-none focus:border-rose-500 transition appearance-none"
                  >
                    <option value="Terlambat Masuk Sekolah">Terlambat Masuk Sekolah</option>
                    <option value="Atribut Tidak Lengkap">Atribut Tidak Lengkap</option>
                    <option value="Rambut Panjang / Tidak Rapi">Rambut Panjang / Tidak Rapi</option>
                    <option value="Sepatu Tidak Sesuai Aturan">Sepatu Tidak Sesuai Aturan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Hari Kejadian</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <select
                    value={kedisForm.dayOccurred}
                    onChange={(e) => setKedisForm({ ...kedisForm, dayOccurred: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-8 text-xs text-white focus:outline-none focus:border-rose-500 transition appearance-none"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Catatan Tambahan</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Catatan..."
                    value={kedisForm.note}
                    onChange={(e) => setKedisForm({ ...kedisForm, note: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-rose-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg shadow-rose-600/20 active:scale-[0.99] mt-2">
                Simpan Pelanggaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT LIMIT JAJAN */}
      {modalOpen === 'editLimit' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setModalOpen(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Pengaturan Limit Jajan Harian</h3>
                <p className="text-xs text-slate-400">Atur batas pengeluaran maksimal per hari</p>
              </div>
            </div>

            <form onSubmit={handleSaveDailyLimit} className="space-y-4 pt-1">
              <div>
                <label className="text-xs text-slate-400 font-medium">Limit Jajan / Hari (Rp)</label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-indigo-400 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    value={newLimitInput}
                    onChange={(e) => setNewLimitInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/20 mt-2">
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH HABIT */}
      {modalOpen === 'habit' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setModalOpen(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Tambah Habit Baru</h3>
                <p className="text-xs text-slate-400">Bangun rutinitas positif harianmu</p>
              </div>
            </div>

            <form onSubmit={handleAddHabit} className="space-y-4 pt-1">
              <div>
                <label className="text-xs text-slate-400 font-medium">Nama Kebiasaan</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Flame className="w-4 h-4 text-amber-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Baca Buku 15 Menit"
                    value={habitTitleInput}
                    onChange={(e) => setHabitTitleInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-amber-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-500/20 mt-2">
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRANSAKSI KEUANGAN */}
      {modalOpen === 'tx' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setModalOpen(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Tambah Transaksi Keuangan</h3>
                <p className="text-xs text-slate-400">Catat uang masuk & pengeluaran harian</p>
              </div>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4 pt-1">
              {/* SEGMENTED TOGGLE JENIS TRANSAKSI */}
              <div>
                <label className="text-xs text-slate-400 font-medium">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFinForm({ ...finForm, type: 'expense' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                      finForm.type === 'expense'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Pengeluaran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinForm({ ...finForm, type: 'income' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                      finForm.type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Pemasukan</span>
                  </button>
                </div>
              </div>

              {/* SEGMENTED TOGGLE DOMPET / SUMBER DANA */}
              <div>
                <label className="text-xs text-slate-400 font-medium">Dompet</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFinForm({ ...finForm, account: 'cash' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition ${
                      finForm.account === 'cash' || !finForm.account
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Cash / Tunai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinForm({ ...finForm, account: 'ewallet' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition ${
                      finForm.account === 'ewallet'
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>E-Wallet</span>
                  </button>
                </div>
              </div>

              {/* INPUT NOMINAL */}
              <div>
                <label className="text-xs text-slate-400 font-medium">Nominal (Rp)</label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-indigo-400 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="15000"
                    value={finForm.amount}
                    onChange={(e) => setFinForm({ ...finForm, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* TANGGAL TRANSAKSI */}
              <div>
                <label className="text-xs text-slate-400 font-medium">Tanggal</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="date"
                    required
                    value={finForm.date}
                    onChange={(e) => setFinForm({ ...finForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* KETERANGAN */}
              <div>
                <label className="text-xs text-slate-400 font-medium">Keterangan</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Nasi Goreng"
                    value={finForm.note}
                    onChange={(e) => setFinForm({ ...finForm, note: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-[0.99] mt-2"
              >
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TARGET NABUNG */}
      {modalOpen === 'savings' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setModalOpen(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Tambah Target Nabung Baru</h3>
                <p className="text-xs text-slate-400">Tentukan target impian yang ingin dicapai</p>
              </div>
            </div>

            <form onSubmit={handleAddSavingsGoal} className="space-y-4 pt-1">
              <div>
                <label className="text-xs text-slate-400 font-medium">Nama Barang</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Target className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sepatu Vans"
                    value={savingsForm.title}
                    onChange={(e) => setSavingsForm({ ...savingsForm, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Target Nominal (Rp)</label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-indigo-400 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="500000"
                    value={savingsForm.targetAmount}
                    onChange={(e) => setSavingsForm({ ...savingsForm, targetAmount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Deadline</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="date"
                    value={savingsForm.deadline}
                    onChange={(e) => setSavingsForm({ ...savingsForm, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/20 mt-2">
                Simpan Target
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL JUALAN */}
      {modalOpen === 'sales' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setModalOpen(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Tambah Produk Jualan Harian</h3>
                <p className="text-xs text-slate-400">Atur harga modal & harga jual barang</p>
              </div>
            </div>

            <form onSubmit={handleAddSales} className="space-y-4 pt-1">
              <div>
                <label className="text-xs text-slate-400 font-medium">Nama Produk</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Risol Mayo"
                    value={salesForm.item}
                    onChange={(e) => setSalesForm({ ...salesForm, item: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Target (Pcs)</label>
                  <input
                    type="number"
                    required
                    value={salesForm.targetQty}
                    onChange={(e) => setSalesForm({ ...salesForm, targetQty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition mt-1.5 text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Modal/Pcs</label>
                  <input
                    type="number"
                    required
                    value={salesForm.costPrice}
                    onChange={(e) => setSalesForm({ ...salesForm, costPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition mt-1.5 text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Jual/Pcs</label>
                  <input
                    type="number"
                    required
                    value={salesForm.sellPrice}
                    onChange={(e) => setSalesForm({ ...salesForm, sellPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition mt-1.5 text-center"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/20 mt-2">
                Simpan Produk
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TARGET BELAJAR */}
      {modalOpen === 'study' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setModalOpen(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Tambah Target Belajar / Tugas</h3>
                <p className="text-xs text-slate-400">Catat tugas & mata pelajaran yang harus diselesaikan</p>
              </div>
            </div>

            <form onSubmit={handleAddStudyGoal} className="space-y-4 pt-1">
              <div>
                <label className="text-xs text-slate-400 font-medium">Mata Pelajaran</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pemrograman"
                    value={studyForm.subject}
                    onChange={(e) => setStudyForm({ ...studyForm, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Topik / Nama Tugas</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kerjakan Bab 3"
                    value={studyForm.topic}
                    onChange={(e) => setStudyForm({ ...studyForm, topic: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Deadline</label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: Besok Jam 08.00"
                    value={studyForm.deadline}
                    onChange={(e) => setStudyForm({ ...studyForm, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/20 mt-2">
                Simpan Target Belajar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DRAF WHATSAPP */}
      {selectedWaDraft && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setSelectedWaDraft(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Draf Pesan Teguran WhatsApp</h3>
                <p className="text-xs text-slate-400">Siap dikirim ke siswa/wali murid</p>
              </div>
            </div>

            <textarea
              readOnly
              rows="6"
              value={selectedWaDraft}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none leading-relaxed"
            />

            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedWaDraft);
                alert('Pesan teguran berhasil dicopy!');
                setSelectedWaDraft(null);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              Salin Teks Pesan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}