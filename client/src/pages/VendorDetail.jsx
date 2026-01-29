import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText, Server, Receipt } from 'lucide-react';
import { vendorsApi } from '../api/client';
import { formatCurrency, formatDate, getStatusStyle, getStatusLabel } from '../utils/format';
import clsx from 'clsx';

export default function VendorDetail() {
  const { id } = useParams();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorsApi.getById(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vendor tidak ditemukan</p>
        <Link to="/vendor" className="text-primary-600 hover:underline mt-2 inline-block">
          Kembali ke daftar vendor
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/vendor" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-4">
          <div
            className="h-16 w-16 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${vendor.color}20` }}
          >
            <Building2 className="h-8 w-8" style={{ color: vendor.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-gray-500">{vendor.short_name}</p>
          </div>
        </div>
      </div>

      {/* Info & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kontak</h3>
          <div className="space-y-3">
            {vendor.contact_person && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">{vendor.contact_person}</span>
              </div>
            )}
            {vendor.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <a href={`mailto:${vendor.email}`} className="text-primary-600 hover:underline">
                  {vendor.email}
                </a>
              </div>
            )}
            {vendor.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">{vendor.phone}</span>
              </div>
            )}
            {vendor.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">{vendor.address}</span>
              </div>
            )}
            {vendor.npwp && (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">NPWP: {vendor.npwp}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-6">
            <p className="text-sm font-medium text-gray-500">Total Transaksi</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{vendor.transaction_count}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm font-medium text-gray-500">Sudah Dibayar</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(vendor.total_paid)}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm font-medium text-gray-500">Belum Dibayar</p>
            <p className="mt-2 text-2xl font-bold text-yellow-600">{formatCurrency(vendor.total_pending)}</p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Layanan ({vendor.services?.length || 0})</h3>
        </div>
        {vendor.services?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada layanan</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendor.services?.map((service) => (
              <div key={service.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                  <span className={clsx(
                    'badge',
                    service.type === 'Software' && 'bg-purple-100 text-purple-800',
                    service.type === 'Network' && 'bg-blue-100 text-blue-800',
                    service.type === 'Infrastructure' && 'bg-green-100 text-green-800',
                    service.type === 'Security' && 'bg-red-100 text-red-800'
                  )}>
                    {service.type}
                  </span>
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {formatCurrency(service.monthly_fee)}/bulan
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
          </div>
          <Link
            to={`/transaksi?vendor_id=${vendor.id}`}
            className="text-sm text-primary-600 hover:underline"
          >
            Lihat semua
          </Link>
        </div>
        {vendor.recentTransactions?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada transaksi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Invoice</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Layanan</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Jatuh Tempo</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendor.recentTransactions?.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/transaksi/${tx.id}`} className="text-primary-600 hover:underline font-medium">
                        {tx.invoice_no}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tx.service_name}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(tx.total)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(tx.due_date)}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', getStatusStyle(tx.status))}>
                        {getStatusLabel(tx.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
