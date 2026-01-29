import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Server, Search } from 'lucide-react';
import { servicesApi, vendorsApi, settingsApi } from '../api/client';
import { formatCurrency } from '../utils/format';
import clsx from 'clsx';

const serviceTypes = ['Software', 'Network', 'Infrastructure', 'Security'];

function ServiceModal({ service, vendors, glAccounts, onClose, onSave }) {
  const [formData, setFormData] = useState({
    vendor_id: service?.vendor_id?.toString() || '',
    name: service?.name || '',
    description: service?.description || '',
    monthly_fee: service?.monthly_fee?.toString() || '',
    type: service?.type || 'Software',
    gl_account_id: service?.gl_account_id?.toString() || '',
    contract_number: service?.contract_number || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      vendor_id: parseInt(formData.vendor_id),
      monthly_fee: parseFloat(formData.monthly_fee) || 0,
      gl_account_id: formData.gl_account_id ? parseInt(formData.gl_account_id) : null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{service ? 'Edit Layanan' : 'Tambah Layanan'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
            <select
              value={formData.vendor_id}
              onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
              className="select"
              required
            >
              <option value="">Pilih Vendor</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Layanan *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Bulanan</label>
              <input
                type="number"
                value={formData.monthly_fee}
                onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                className="input"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="select"
                required
              >
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GL Account</label>
              <select
                value={formData.gl_account_id}
                onChange={(e) => setFormData({ ...formData, gl_account_id: e.target.value })}
                className="select"
              >
                <option value="">Pilih GL Account</option>
                {glAccounts.map(gl => (
                  <option key={gl.id} value={gl.id}>{gl.code} - {gl.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No Kontrak</label>
              <input
                type="text"
                value={formData.contract_number}
                onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Services() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [filters, setFilters] = useState({ vendor_id: '', type: '', search: '' });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorsApi.getAll,
  });

  const { data: glAccounts } = useQuery({
    queryKey: ['gl-accounts'],
    queryFn: settingsApi.getGlAccounts,
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', filters.vendor_id, filters.type],
    queryFn: () => servicesApi.getAll({
      vendor_id: filters.vendor_id || undefined,
      type: filters.type || undefined,
    }),
  });

  const filteredServices = (services || []).filter(s =>
    filters.search ? s.name.toLowerCase().includes(filters.search.toLowerCase()) : true
  );

  const createMutation = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setEditingService(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
    },
  });

  const handleSave = (data) => {
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const typeColors = {
    Software: 'bg-purple-100 text-purple-800',
    Network: 'bg-blue-100 text-blue-800',
    Infrastructure: 'bg-green-100 text-green-800',
    Security: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Layanan</h1>
          <p className="text-gray-500">Kelola data layanan/jasa vendor</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2 w-fit">
          <Plus className="h-5 w-5" />
          Tambah Layanan
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari layanan..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="select w-full sm:w-48"
            value={filters.vendor_id}
            onChange={(e) => setFilters({ ...filters, vendor_id: e.target.value })}
          >
            <option value="">Semua Vendor</option>
            {(vendors || []).map(v => (
              <option key={v.id} value={v.id}>{v.short_name}</option>
            ))}
          </select>
          <select
            className="select w-full sm:w-40"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">Semua Tipe</option>
            {serviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Layanan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipe</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Biaya/Bulan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">GL Account</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Memuat...</td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Tidak ada layanan ditemukan</td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Server className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{service.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: service.vendor_color }}
                        />
                        <span className="text-sm text-gray-700">{service.vendor_short_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', typeColors[service.type])}>
                        {service.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(service.monthly_fee)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {service.gl_code ? `${service.gl_code}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditingService(service)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Yakin ingin menghapus layanan ini?')) {
                              deleteMutation.mutate(service.id);
                            }
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {(showModal || editingService) && (
        <ServiceModal
          service={editingService}
          vendors={vendors || []}
          glAccounts={glAccounts || []}
          onClose={() => { setShowModal(false); setEditingService(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
