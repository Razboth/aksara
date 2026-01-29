import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { transactionsApi, vendorsApi, servicesApi, settingsApi } from '../api/client';
import { formatCurrency, getMonthOptions, getYearOptions } from '../utils/format';
import clsx from 'clsx';

const transactionSchema = z.object({
  vendor_id: z.string().min(1, 'Pilih vendor'),
  service_id: z.string().min(1, 'Pilih layanan'),
  invoice_no: z.string().min(1, 'No invoice wajib diisi'),
  period_year: z.string().min(1, 'Pilih tahun'),
  period_month: z.string().min(1, 'Pilih bulan'),
  nominal: z.string().min(1, 'Nominal wajib diisi'),
  ppn: z.string(),
  total: z.string(),
  invoice_date: z.string().min(1, 'Tanggal invoice wajib diisi'),
  due_date: z.string().min(1, 'Tanggal jatuh tempo wajib diisi'),
  received_date: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export default function TransactionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [selectedVendorId, setSelectedVendorId] = useState('');

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getAll,
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorsApi.getAll,
  });

  const { data: services } = useQuery({
    queryKey: ['services', selectedVendorId],
    queryFn: () => servicesApi.getAll({ vendor_id: selectedVendorId }),
    enabled: Boolean(selectedVendorId),
  });

  const { data: transaction, isLoading: loadingTransaction } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsApi.getById(id),
    enabled: isEditing,
  });

  const ppnRate = parseFloat(settings?.ppn_rate?.value || '0.11');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      vendor_id: '',
      service_id: '',
      invoice_no: '',
      period_year: new Date().getFullYear().toString(),
      period_month: String(new Date().getMonth() + 1).padStart(2, '0'),
      nominal: '',
      ppn: '',
      total: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: '',
      received_date: '',
      status: 'pending',
      notes: '',
    },
  });

  // Load transaction data when editing
  useEffect(() => {
    if (transaction) {
      const [year, month] = transaction.period.split('-');
      setSelectedVendorId(String(transaction.vendor_id));
      reset({
        vendor_id: String(transaction.vendor_id),
        service_id: String(transaction.service_id),
        invoice_no: transaction.invoice_no,
        period_year: year,
        period_month: month,
        nominal: String(transaction.nominal),
        ppn: String(transaction.ppn),
        total: String(transaction.total),
        invoice_date: transaction.invoice_date,
        due_date: transaction.due_date,
        received_date: transaction.received_date || '',
        status: transaction.status,
        notes: transaction.notes || '',
      });
    }
  }, [transaction, reset]);

  const watchVendorId = watch('vendor_id');
  const watchNominal = watch('nominal');
  const watchServiceId = watch('service_id');

  // Update vendor selection
  useEffect(() => {
    if (watchVendorId && watchVendorId !== selectedVendorId) {
      setSelectedVendorId(watchVendorId);
      if (!isEditing) {
        setValue('service_id', '');
      }
    }
  }, [watchVendorId, selectedVendorId, setValue, isEditing]);

  // Auto-fill monthly fee when service selected
  useEffect(() => {
    if (watchServiceId && services && !isEditing) {
      const service = services.find(s => String(s.id) === watchServiceId);
      if (service && service.monthly_fee > 0) {
        setValue('nominal', String(service.monthly_fee));
      }
    }
  }, [watchServiceId, services, setValue, isEditing]);

  // Auto-calculate PPN and total
  useEffect(() => {
    const nominal = parseFloat(watchNominal) || 0;
    const ppn = Math.round(nominal * ppnRate);
    const total = nominal + ppn;
    setValue('ppn', String(ppn));
    setValue('total', String(total));
  }, [watchNominal, ppnRate, setValue]);

  const createMutation = useMutation({
    mutationFn: (data) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['dashboard']);
      navigate('/transaksi');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['dashboard']);
      navigate('/transaksi');
    },
  });

  const onSubmit = (data) => {
    const payload = {
      vendor_id: parseInt(data.vendor_id),
      service_id: parseInt(data.service_id),
      invoice_no: data.invoice_no,
      period: `${data.period_year}-${data.period_month}`,
      nominal: parseFloat(data.nominal),
      ppn: parseFloat(data.ppn),
      total: parseFloat(data.total),
      invoice_date: data.invoice_date,
      due_date: data.due_date,
      received_date: data.received_date || null,
      status: data.status || 'pending',
      notes: data.notes || null,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditing && loadingTransaction) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h1>
          <p className="text-gray-500">
            {isEditing ? 'Ubah data transaksi' : 'Input tagihan baru dari vendor'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        {/* Vendor & Service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor <span className="text-red-500">*</span>
            </label>
            <select {...register('vendor_id')} className={clsx('select', errors.vendor_id && 'border-red-500')}>
              <option value="">Pilih Vendor</option>
              {(vendors || []).map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {errors.vendor_id && <p className="mt-1 text-sm text-red-500">{errors.vendor_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Layanan <span className="text-red-500">*</span>
            </label>
            <select
              {...register('service_id')}
              className={clsx('select', errors.service_id && 'border-red-500')}
              disabled={!selectedVendorId}
            >
              <option value="">Pilih Layanan</option>
              {(services || []).map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.monthly_fee > 0 && `(${formatCurrency(s.monthly_fee)})`}
                </option>
              ))}
            </select>
            {errors.service_id && <p className="mt-1 text-sm text-red-500">{errors.service_id.message}</p>}
          </div>
        </div>

        {/* Invoice Number & Period */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No Invoice <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('invoice_no')}
              className={clsx('input', errors.invoice_no && 'border-red-500')}
              placeholder="INV-XXX-2025-01"
            />
            {errors.invoice_no && <p className="mt-1 text-sm text-red-500">{errors.invoice_no.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun Periode <span className="text-red-500">*</span>
            </label>
            <select {...register('period_year')} className="select">
              {getYearOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan Periode <span className="text-red-500">*</span>
            </label>
            <select {...register('period_month')} className="select">
              {getMonthOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nominal <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('nominal')}
              className={clsx('input', errors.nominal && 'border-red-500')}
              placeholder="0"
            />
            {errors.nominal && <p className="mt-1 text-sm text-red-500">{errors.nominal.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PPN ({(ppnRate * 100).toFixed(0)}%)
            </label>
            <input
              type="number"
              {...register('ppn')}
              className="input bg-gray-50"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
            <input
              type="number"
              {...register('total')}
              className="input bg-gray-50 font-semibold"
              readOnly
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Invoice <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('invoice_date')}
              className={clsx('input', errors.invoice_date && 'border-red-500')}
            />
            {errors.invoice_date && <p className="mt-1 text-sm text-red-500">{errors.invoice_date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jatuh Tempo <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('due_date')}
              className={clsx('input', errors.due_date && 'border-red-500')}
            />
            {errors.due_date && <p className="mt-1 text-sm text-red-500">{errors.due_date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Terima</label>
            <input
              type="date"
              {...register('received_date')}
              className="input"
            />
          </div>
        </div>

        {/* Status (only when editing) */}
        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="select w-full md:w-48">
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="paid">Dibayar</option>
              <option value="overdue">Jatuh Tempo</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea
            {...register('notes')}
            className="input"
            rows={3}
            placeholder="Catatan tambahan..."
          />
        </div>

        {/* Error message */}
        {(createMutation.error || updateMutation.error) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {createMutation.error?.response?.data?.error || updateMutation.error?.response?.data?.error || 'Terjadi kesalahan'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isEditing ? 'Simpan Perubahan' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
}
