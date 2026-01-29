import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Filter, Download, FileSpreadsheet, ChevronLeft, ChevronRight,
  MoreHorizontal, Eye, Edit, Trash2, Check, X,
} from 'lucide-react';
import { transactionsApi, vendorsApi, reportsApi } from '../api/client';
import { formatCurrency, formatDate, formatPeriod, getStatusStyle, getStatusLabel, getYearOptions } from '../utils/format';
import clsx from 'clsx';

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'overdue', label: 'Jatuh Tempo' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function Transactions() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    vendor_id: searchParams.get('vendor_id') || '',
    status: searchParams.get('status') || '',
    year: searchParams.get('year') || new Date().getFullYear().toString(),
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [actionMenuId, setActionMenuId] = useState(null);

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorsApi.getAll,
  });

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getAll(filters),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, pay_date }) => transactionsApi.updateStatus(id, { status, pay_date }),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['dashboard']);
      setActionMenuId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['dashboard']);
      setActionMenuId(null);
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, status }) => transactionsApi.bulkUpdateStatus({
      ids,
      status,
      pay_date: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['dashboard']);
      setSelectedIds([]);
    },
  });

  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    setSearchParams(newFilters);
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    setSearchParams({ ...filters, page: newPage.toString() });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t.id));
    }
  };

  const handleMarkAsPaid = (id) => {
    updateStatusMutation.mutate({
      id,
      status: 'paid',
      pay_date: new Date().toISOString().split('T')[0],
    });
  };

  const exportParams = {
    ...(filters.vendor_id && { vendor_id: filters.vendor_id }),
    ...(filters.status && { status: filters.status }),
    ...(filters.year && { year: filters.year }),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-gray-500">Kelola tagihan dan invoice vendor</p>
        </div>
        <Link to="/transaksi/baru" className="btn btn-primary flex items-center gap-2 w-fit">
          <Plus className="h-5 w-5" />
          Tambah Transaksi
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari no invoice..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <select
            className="select w-full lg:w-40"
            value={filters.vendor_id}
            onChange={(e) => handleFilterChange('vendor_id', e.target.value)}
          >
            <option value="">Semua Vendor</option>
            {(vendors || []).map(v => (
              <option key={v.id} value={v.id}>{v.short_name}</option>
            ))}
          </select>
          <select
            className="select w-full lg:w-40"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="select w-full lg:w-32"
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          >
            {getYearOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <a
              href={reportsApi.exportTransactionsCsv(exportParams)}
              className="btn btn-secondary flex items-center gap-2"
              download
            >
              <Download className="h-4 w-4" />
              CSV
            </a>
            <a
              href={reportsApi.exportTransactionsExcel(exportParams)}
              className="btn btn-secondary flex items-center gap-2"
              download
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </a>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="card p-4 bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700">
              {selectedIds.length} transaksi dipilih
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => bulkUpdateMutation.mutate({ ids: selectedIds, status: 'approved' })}
                className="btn btn-secondary text-sm"
                disabled={bulkUpdateMutation.isPending}
              >
                Setujui
              </button>
              <button
                onClick={() => bulkUpdateMutation.mutate({ ids: selectedIds, status: 'paid' })}
                className="btn btn-success text-sm"
                disabled={bulkUpdateMutation.isPending}
              >
                Tandai Dibayar
              </button>
              <button onClick={() => setSelectedIds([])} className="btn btn-secondary text-sm">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === transactions.length && transactions.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Layanan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Periode</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Jatuh Tempo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Memuat...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada transaksi ditemukan
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(tx.id)}
                        onChange={() => toggleSelect(tx.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{tx.invoice_no}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: tx.vendor_color }}
                        />
                        <span className="text-sm text-gray-700">{tx.vendor_short_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 truncate max-w-xs block" title={tx.service_name}>
                        {tx.service_name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{formatPeriod(tx.period)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(tx.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'text-sm',
                        new Date(tx.due_date) < new Date() && tx.status !== 'paid' ? 'text-red-600 font-medium' : 'text-gray-600'
                      )}>
                        {formatDate(tx.due_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', getStatusStyle(tx.status))}>
                        {getStatusLabel(tx.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuId(actionMenuId === tx.id ? null : tx.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreHorizontal className="h-5 w-5 text-gray-500" />
                        </button>

                        {actionMenuId === tx.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <Link
                                to={`/transaksi/${tx.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Link>
                              <a
                                href={reportsApi.getTransactionPdf(tx.id)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="h-4 w-4" />
                                Lihat PDF
                              </a>
                              {tx.status !== 'paid' && (
                                <button
                                  onClick={() => handleMarkAsPaid(tx.id)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <Check className="h-4 w-4" />
                                  Tandai Dibayar
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm('Yakin ingin menghapus transaksi ini?')) {
                                    deleteMutation.mutate(tx.id);
                                  }
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                                Hapus
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn btn-secondary p-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn btn-secondary p-2"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
