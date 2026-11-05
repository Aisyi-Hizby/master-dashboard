import React, { useState } from 'react';
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Shield, User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State Daftar Akun
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form State Login (Username / Email)
  const [loginIdentifier, setLoginIdentifier] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // --- MASUK (LOGIN) ---
        let targetEmail = loginIdentifier.trim().toLowerCase();

        // Jika input bukan email (tidak ada '@'), cari email berdasarkan username di Firestore
        if (!targetEmail.includes('@')) {
          const usernameDocRef = doc(db, 'usernames', targetEmail);
          const usernameSnap = await getDoc(usernameDocRef);

          if (usernameSnap.exists()) {
            targetEmail = usernameSnap.data().email;
          } else {
            throw new Error('Username tidak ditemukan!');
          }
        }

        await signInWithEmailAndPassword(auth, targetEmail, password);
      } else {
        // --- DAFTAR AKUN ---
        const cleanUsername = username.trim().toLowerCase();

        if (!cleanUsername || cleanUsername.length < 3) {
          throw new Error('Username minimal 3 karakter!');
        }

        if (password !== confirmPassword) {
          throw new Error('Konfirmasi kata sandi tidak cocok!');
        }

        // Cek apakah username sudah dipakai
        const usernameDocRef = doc(db, 'usernames', cleanUsername);
        const usernameSnap = await getDoc(usernameDocRef);

        if (usernameSnap.exists()) {
          throw new Error('Username sudah digunakan. Silakan gunakan username lain!');
        }

        // Buat Akun Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Simpan pemetaan Username -> Email di Firestore
        await setDoc(usernameDocRef, {
          email: email.toLowerCase(),
          uid: user.uid
        });

        // Simpan profil pengguna
        await setDoc(
          doc(db, 'users', user.uid),
          {
            username: cleanUsername,
            email: email.toLowerCase()
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar. Silakan pilih menu Masuk!');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Username/Email atau Password salah!');
      } else if (err.code === 'auth/weak-password') {
        setError('Kata sandi terlalu lemah (minimal 6 karakter)!');
      } else {
        setError(err.message || 'Terjadi kesalahan saat memproses akun.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const defaultUsername = user.email.split('@')[0].toLowerCase();
        await setDoc(userDocRef, {
          username: defaultUsername,
          email: user.email.toLowerCase()
        });

        await setDoc(doc(db, 'usernames', defaultUsername), {
          email: user.email.toLowerCase(),
          uid: user.uid
        });
      }
    } catch (err) {
      console.error(err);
      setError('Gagal masuk menggunakan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl w-full max-w-md p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        {/* LOGO & TITLE */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Master Dashboard
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Platform Personal Finance, Target Penjualan, & Catatan Kedisiplinan
          </p>
        </div>

        {/* TAB TOGGLE */}
        <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition ${
              isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition ${
              !isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleAuth} className="space-y-4">
          {isLogin ? (
            /* --- FORM LOGIN --- */
            <>
              <div>
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
                  USERNAME ATAU EMAIL
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Username atau user@gmail.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
                  KATA SANDI (PASSWORD)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* --- FORM DAFTAR AKUN --- */
            <>
              {/* 1. USERNAME */}
              <div>
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
                  USERNAME
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Masukan Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* 2. ALAMAT EMAIL */}
              <div>
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
                  ALAMAT EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* 3. KATA SANDI (PASSWORD) */}
              <div>
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
                  KATA SANDI (PASSWORD)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 4. KONFIRMASI KATA SANDI */}
              <div>
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
                  KONFIRMASI KATA SANDI
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi kata sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* BUTTON SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>{isLogin ? 'Masuk Sekarang' : 'Buat Akun Sekarang'}</span>
            )}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase absolute">
            Atau Lanjut Dengan
          </span>
        </div>

        {/* GOOGLE SIGN IN */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Masuk menggunakan Google</span>
        </button>

        {/* FOOTER INFO */}
        <div className="flex justify-around text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
          <span>Keuangan</span>
          <span>•</span>
          <span>Penjualan</span>
          <span>•</span>
          <span>Kedisiplinan</span>
        </div>
      </div>
    </div>
  );
}