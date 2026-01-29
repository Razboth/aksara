import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Download, FileSpreadsheet, Edit2, Plus, X, Save } from 'lucide-react';
import { budgetsApi, vendorsApi, reportsApi } from '../api/client';
import { formatCurrency, formatPercent, getYearOptions } from '../utils/format';
import clsx from 'clsx';

function BudgetEditModal({ budget, vendors, onClose, onSave }) {
  const [vendorId, setVendorId] = useState(budget?.vendor_id?.toString() || '');
  const [amount, setAmount] = useState(budget?.budget_amount?.toString() || '');
  const [description, setDescription] = useState(budget?.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: budget?.id,
      vendor_id: parseInt(vendorId),
      budget_amount: parseFloat(amount),
      description,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{budget ? 'Edit Anggaran' : 'Tambah Anggaran'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="select"
              required
              disabled={Boolean(budget)}
            >
              <option value="">Pilih Vendor</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Anggaran</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={2}
            />
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

export default function Budgets() {
  const queryClient = useQueryClient();
  const [year, setYear] = useState(new Date().getFullYear());
  const [editingBudget, setEditingBudget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorsApi.getAll,
  });

  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['budget-vs-actual', year],
    queryFn: () => budgetsApi.getVsActual(year),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => budgetsApi.create({ ...data, year }),
    onSuccess: () => {
      queryClient.invalidateQueries(['budget-vs-actual']);
      queryClient.invalidateQueries(['budgets']);
      setEditingBudget(null);
      setShowAddModal(false);
    },
  });

  const comparison = budgetData?.comparison || [];
  const summary = budgetData?.summary || {};

  const chartData = comparison.map(item => ({
    name: item.short_name,
    anggaran: item.budget,
    realisasi: item.actual_total,
    fill: item.vendor_color,
  }));

  const pieData = comparison.filter(item => item.actual_total > 0).map(item => ({
    name: item.short_name,
    value: item.actual_total,
    color: item.vendor_color,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anggaran</h1>
          <p className="text-gray-500">Perbandingan anggaran vs realisasi</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="select w-32"
          >
            {getYearOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah
          </button>
          <a
            href={reportsApi.exportBudgetExcel(year)}
            className="btn btn-secondary flex items-center gap-2"
            download
          >
            <FileSpreadsheet className="h-5 w-5" />
            Export
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <p className="text-sm font-medium text-gray-500">Total Anggaran</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(summary.totalBudget || 0)}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-gray-500">Total Realisasi</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(summary.totalActual || 0)}</p>
          <p className="text-sm text-gray-500">{formatPercent(summary.utilizationPercent || 0)}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-gray-500">Dibayar</p>
          <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid || 0)}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-gray-500">Sisa Anggaran</p>
          <p className="mt-2 text-2xl font-bold text-primary-600">{formatCurrency(summary.remaining || 0)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Realisasi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Anggaran vs Realisasi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000000000).toFixed(0)}M`} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="anggaran" name="Anggaran" fill="#93c5fd" radius={[0, 4, 4, 0]} />
                <Bar dataKey="realisasi" name="Realisasi" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Anggaran</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Realisasi</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Dibayar</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Pending</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Sisa</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">%</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Memuat...</td>
                </tr>
              ) : comparison.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Belum ada data anggaran</td>
                </tr>
              ) : (
                comparison.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.vendor_color }} />
                        <span className="font-medium text-gray-900">{item.vendor_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.budget)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {formatCurrency(item.actual_total)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {formatCurrency(item.actual_paid)}
                    </td>
                    <td className="px-4 py-3 text-right text-yellow-600">
                      {formatCurrency(item.actual_pending)}
                    </td>
                    <td className={clsx(
                      'px-4 py-3 text-right font-medium',
                      item.remaining < 0 ? 'text-red-600' : 'text-gray-900'
                    )}>
                      {formatCurrency(item.remaining)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={clsx(
                              'h-2 rounded-full',
                              item.utilizationPercent > 100 ? 'bg-red-500' : item.utilizationPercent > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            )}
                            style={{ width: `${Math.min(item.utilizationPercent, 100)}%` }}
                          />
                        </div>
                        <span className={clsx(
                          'text-sm font-medium',
                          item.utilizationPercent > 100 ? 'text-red-600' : 'text-gray-700'
                        )}>
                          {formatPercent(item.utilizationPercent, 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingBudget(item)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {comparison.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td className="px-4 py-3 font-bold text-gray-900">TOTAL</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(summary.totalBudget)}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(summary.totalActual)}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(summary.totalPaid)}</td>
                  <td className="px-4 py-3 text-right font-bold text-yellow-600">{formatCurrency(summary.totalPending)}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary-600">{formatCurrency(summary.remaining)}</td>
                  <td className="px-4 py-3 text-center font-bold">{formatPercent(summary.utilizationPercent, 0)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {(editingBudget || showAddModal) && (
        <BudgetEditModal
          budget={editingBudget}
          vendors={vendors || []}
          onClose={() => { setEditingBudget(null); setShowAddModal(false); }}
          onSave={(data) => saveMutation.mutate(data)}
        />
      )}
    </div>
  );
}
