import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, RefreshCw, Database, Building, Percent, Bell } from 'lucide-react';
import { settingsApi, transactionsApi } from '../api/client';

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getAll,
  });

  const [formData, setFormData] = useState({
    company_name: '',
    division_name: '',
    ppn_rate: '',
    reminder_days_before: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name?.value || '',
        division_name: settings.division_name?.value || '',
        ppn_rate: settings.ppn_rate?.value || '0.11',
        reminder_days_before: settings.reminder_days_before?.value || '7',
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
    },
  });

  const markOverdueMutation = useMutation({
    mutationFn: transactionsApi.markOverdue,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['dashboard']);
      queryClient.invalidateQueries(['notifications']);
      alert(`${data.updated} transaksi ditandai sebagai jatuh tempo`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500">Konfigurasi aplikasi</p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building className="h-5 w-5" />
          Informasi Perusahaan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Divisi</label>
            <input
              type="text"
              value={formData.division_name}
              onChange={(e) => setFormData({ ...formData, division_name: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <hr className="border-gray-200" />

        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Percent className="h-5 w-5" />
          Pengaturan Pajak
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tarif PPN</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.ppn_rate}
              onChange={(e) => setFormData({ ...formData, ppn_rate: e.target.value })}
              className="input w-32"
            />
            <span className="text-gray-500">
              ({(parseFloat(formData.ppn_rate) * 100 || 0).toFixed(0)}%)
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Masukkan dalam format desimal (0.11 = 11%, 0.12 = 12%)
          </p>
        </div>

        <hr className="border-gray-200" />

        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Pengaturan Notifikasi
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reminder Sebelum Jatuh Tempo (hari)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={formData.reminder_days_before}
            onChange={(e) => setFormData({ ...formData, reminder_days_before: e.target.value })}
            className="input w-32"
          />
          <p className="mt-1 text-sm text-gray-500">
            Notifikasi akan muncul untuk tagihan yang jatuh tempo dalam {formData.reminder_days_before} hari
          </p>
        </div>

        {/* Success/Error message */}
        {updateMutation.isSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">Pengaturan berhasil disimpan</p>
          </div>
        )}

        {updateMutation.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">Gagal menyimpan pengaturan</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary flex items-center gap-2"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Simpan Pengaturan
          </button>
        </div>
      </form>

      {/* Database Actions */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Aksi Database
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Tandai Tagihan Jatuh Tempo</h4>
            <p className="text-sm text-gray-500 mb-2">
              Otomatis menandai semua tagihan yang sudah melewati tanggal jatuh tempo sebagai "overdue"
            </p>
            <button
              onClick={() => markOverdueMutation.mutate()}
              className="btn btn-secondary flex items-center gap-2"
              disabled={markOverdueMutation.isPending}
            >
              {markOverdueMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Jalankan
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card p-6 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">Informasi Aplikasi</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Sistem Anggaran Divisi TI - Bank SulutGo</p>
          <p>Versi: 1.0.0</p>
          <p>Database: SQLite</p>
        </div>
      </div>
    </div>
  );
}
