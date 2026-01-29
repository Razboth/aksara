import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Building2, X, Eye } from 'lucide-react';
import { vendorsApi } from '../api/client';
import { formatCurrency } from '../utils/format';
import clsx from 'clsx';

function VendorModal({ vendor, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    short_name: vendor?.short_name || '',
    color: vendor?.color || '#3B82F6',
    contact_person: vendor?.contact_person || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    address: vendor?.address || '',
    npwp: vendor?.npwp || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{vendor ? 'Edit Vendor' : 'Tambah Vendor'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Singkat *</label>
              <input
                type="text"
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-full rounded-lg border border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NPWP</label>
              <input
                type="text"
                value={formData.npwp}
                onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                className="input"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input"
                rows={2}
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

export default function Vendors() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: vendorsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['vendors']);
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vendorsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendors']);
      setEditingVendor(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vendorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['vendors']);
    },
  });

  const handleSave = (data) => {
    if (editingVendor) {
      updateMutation.mutate({ id: editingVendor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor</h1>
          <p className="text-gray-500">Kelola data vendor/supplier</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2 w-fit">
          <Plus className="h-5 w-5" />
          Tambah Vendor
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Memuat...</div>
        ) : (
          (vendors || []).map((vendor) => (
            <div key={vendor.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${vendor.color}20` }}
                  >
                    <Building2 className="h-6 w-6" style={{ color: vendor.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{vendor.short_name}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-[180px]" title={vendor.name}>
                      {vendor.name}
                    </p>
                  </div>
                </div>
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: vendor.color }}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Transaksi</p>
                  <p className="font-semibold text-gray-900">{vendor.transaction_count || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Nilai</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(vendor.total_transactions || 0)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <span className={clsx(
                    'badge',
                    vendor.paid_count > 0 ? 'badge-success' : 'badge-gray'
                  )}>
                    {vendor.paid_count} dibayar
                  </span>
                  {vendor.pending_count > 0 && (
                    <span className="badge badge-warning">{vendor.pending_count} pending</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Link
                    to={`/vendor/${vendor.id}`}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Detail"
                  >
                    <Eye className="h-4 w-4 text-gray-500" />
                  </Link>
                  <button
                    onClick={() => setEditingVendor(vendor)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Yakin ingin menghapus vendor ini?')) {
                        deleteMutation.mutate(vendor.id);
                      }
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {(showModal || editingVendor) && (
        <VendorModal
          vendor={editingVendor}
          onClose={() => { setShowModal(false); setEditingVendor(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
