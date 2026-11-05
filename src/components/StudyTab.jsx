import React from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  Plus,
  Trash2,
  BookOpen,
  Check,
  Flame,
  Clock,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

export default function StudyTab({
  studyData,
  habitsData,
  selectedCalendarDate,
  setSelectedCalendarDate,
  sortedEvents,
  handleDeleteEvent,
  handleToggleStudy,
  handleDeleteStudy,
  handleToggleHabit,
  handleDeleteHabit,
  pomoInitialTime,
  pomoTime,
  pomoRunning,
  setPomoRunning,
  setPomoTime,
  handleAdjustPomo,
  handleSetPomoPreset,
  setModalOpen
}) {
  return (
    <div className="space-y-6">
      {/* KALENDER & AGENDA */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-sky-400" />
              <span>Kalender Agenda & Pengingat Kegiatan</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Pantau jadwal tugas sekolah, asrama, dan ujian harian</p>
          </div>
          <button
            onClick={() => setModalOpen('event')}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-3.5 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Agenda Baru</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold text-sky-400 flex items-center space-x-1.5">
              <Bell className="w-3.5 h-3.5" />
              <span>Pilih Tanggal Pengingat</span>
            </span>
            <input
              type="date"
              value={selectedCalendarDate}
              onChange={(e) => setSelectedCalendarDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
            <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              Dipilih: <b className="text-slate-200">{selectedCalendarDate}</b>
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-200">Agenda Mendatang / Hari Ini</span>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {sortedEvents.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Belum ada agenda tersimpan di kalender.</p>
              ) : (
                sortedEvents.map((ev) => {
                  const isSelected = ev.date === selectedCalendarDate;
                  return (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-xl border flex justify-between items-center transition text-xs ${
                        isSelected
                          ? 'bg-sky-950/60 border-sky-500/50 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-100">{ev.title}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                            ev.category === 'Sekolah'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : ev.category === 'Asrama'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {ev.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          📅 Tanggal: <b className="text-sky-300">{ev.date}</b> {ev.note && `• Catatan: ${ev.note}`}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteEvent(ev.id)} className="text-slate-500 hover:text-red-400 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BELAJAR & HABIT GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Target Belajar & Tugas Sekolah/Asrama</span>
            </h3>
            <button
              onClick={() => setModalOpen('study')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          <div className="space-y-2">
            {studyData.map((st) => (
              <div key={st.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleStudy(st.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      st.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700'
                    }`}
                  >
                    {st.completed && <Check className="w-3 h-3" />}
                  </button>
                  <div>
                    <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      {st.subject}
                    </span>
                    <p className={`text-xs md:text-sm mt-1 font-medium ${st.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {st.topic}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-md">{st.deadline}</span>
                  <button onClick={() => handleDeleteStudy(st.id)} className="text-slate-500 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Checklist Kedisiplinan & Target Harian</span>
            </h4>
            <button
              onClick={() => setModalOpen('habit')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
          <div className="space-y-2">
            {habitsData.map((h) => (
              <div
                key={h.id}
                onClick={() => handleToggleHabit(h.id)}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center cursor-pointer hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      h.completed ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700'
                    }`}
                  >
                    {h.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`text-xs ${h.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {h.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {h.streak}d streak
                  </span>
                  <button onClick={(e) => handleDeleteHabit(h.id, e)} className="text-slate-600 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POMODORO TIMER */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
        <Clock className="w-8 h-8 text-indigo-400" />
        <h4 className="font-bold text-sm text-slate-200">Timer Fokus Belajar (Pomodoro)</h4>
        <p className="text-xs text-slate-400">
          Sesi fokus {Math.floor(pomoInitialTime / 60)} menit untuk tugas atau belajar ujian
        </p>

        <div className="flex items-center justify-center space-x-2 my-2">
          <button
            onClick={() => handleAdjustPomo(-5)}
            disabled={pomoRunning || pomoInitialTime <= 5 * 60}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300 hover:bg-slate-700 font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            -5m
          </button>
          <button
            onClick={() => handleAdjustPomo(-1)}
            disabled={pomoRunning || pomoInitialTime <= 1 * 60}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300 hover:bg-slate-700 font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            -1m
          </button>

          <div className="text-4xl md:text-5xl font-extrabold text-indigo-400 tracking-wider px-3 my-2">
            {Math.floor(pomoTime / 60).toString().padStart(2, '0')}:{(pomoTime % 60).toString().padStart(2, '0')}
          </div>

          <button
            onClick={() => handleAdjustPomo(1)}
            disabled={pomoRunning}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300 hover:bg-slate-700 font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +1m
          </button>
          <button
            onClick={() => handleAdjustPomo(5)}
            disabled={pomoRunning}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300 hover:bg-slate-700 font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +5m
          </button>
        </div>

        <div className="flex items-center space-x-1.5 pb-2">
          <span className="text-[10px] text-slate-500 mr-1">Preset:</span>
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => handleSetPomoPreset(mins)}
              disabled={pomoRunning}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                Math.floor(pomoInitialTime / 60) === mins
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              } disabled:opacity-30`}
            >
              {mins}m
            </button>
          ))}
        </div>

        <div className="flex space-x-2 pt-1">
          <button
            onClick={() => setPomoRunning(!pomoRunning)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-5 py-2.5 rounded-xl font-medium flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20 transition"
          >
            {pomoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{pomoRunning ? 'Pause' : 'Start Focus'}</span>
          </button>
          <button
            onClick={() => {
              setPomoRunning(false);
              setPomoTime(pomoInitialTime);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}