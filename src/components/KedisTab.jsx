import React from 'react';
import {
  ShieldAlert,
  Download,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Share2,
  Trash2
} from 'lucide-react';

export default function KedisTab({
  filteredViolations,
  kedisSearch,
  setKedisSearch,
  filterBandel,
  setFilterBandel,
  handleToggleKedisStatus,
  handleDeleteKedis,
  handleExportKedisText,
  setSelectedWaDraft,
  setModalOpen
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>Buku Catatan Kedisiplinan OSIS</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Pencatatan pelanggaran kedisiplinan siswa</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportKedisText}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-xl font-medium flex items-center space-x-1 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Rekap</span>
            </button>
            <button
              onClick={() => setModalOpen('kedis')}
              className="bg-red-600 hover:bg-red-500 text-white text-xs px-4 py-2.5 rounded-xl font-medium flex items-center justify-center space-x-1.5 shadow-lg shadow-red-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pelanggaran</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari Siswa, Kelas, atau Hari (misal: Senin)..."
              value={kedisSearch}
              onChange={(e) => setKedisSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-red-500 text-white"
            />
          </div>
          <button
            onClick={() => setFilterBandel(!filterBandel)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
              filterBandel ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {filterBandel ? '🔥 Urutan Siswa Sering Melanggar' : 'Urutkan Normal'}
          </button>
        </div>
      </div>

      {/* TABEL PELANGGARAN */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Siswa / Kelas</th>
                <th className="p-3">Pelanggaran</th>
                <th className="p-3">Hari Kejadian</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-5 text-center text-slate-500">
                    Tidak ada data pelanggaran.
                  </td>
                </tr>
              ) : (
                filteredViolations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/30">
                    <td className="p-3">
                      <p className="font-bold text-slate-100">{v.studentName}</p>
                      <span className="text-[10px] text-slate-400">{v.class}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md font-medium">
                        {v.type}
                      </span>
                      {v.note && <p className="text-[10px] text-slate-400 mt-1">{v.note}</p>}
                    </td>
                    <td className="p-3 font-semibold text-slate-200">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Hari {v.dayOccurred}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleKedisStatus(v.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition ${
                          v.status === 'Selesai'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {v.status}
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() =>
                          setSelectedWaDraft(
                            `Halo *${v.studentName}* (${v.class}), ini dari Kedis OSIS. Pengingat catatan pelanggaran: *${v.type}* pada hari *${v.dayOccurred}* (${v.date}). Harap segera diperbaiki. Terima kasih.`
                          )
                        }
                        className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 p-1.5 rounded-lg inline-flex items-center"
                        title="Kirim Draf WA"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteKedis(v.id)}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 p-1.5 rounded-lg inline-flex items-center"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}   