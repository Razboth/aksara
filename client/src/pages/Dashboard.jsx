import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Clock, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { dashboardApi } from '../api/client';
import { formatCurrency, formatPercent, getStatusStyle, getStatusLabel, formatDate } from '../utils/format';
import clsx from 'clsx';

function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'rose' }) {
  const colorStyles = {
    rose: 'bg-gradient-to-br from-aksara-rose/20 to-aksara-blush/30 text-aksara-rose',
    green: 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600',
    yellow: 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600',
    red: 'bg-gradient-to-br from-red-100 to-red-50 text-red-600',
    purple: 'bg-gradient-to-br from-aksara-taupe/30 to-aksara-sand/30 text-aksara-charcoal',
    charcoal: 'bg-gradient-to-br from-aksara-charcoal/20 to-neutral-200 text-aksara-charcoal',
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-aksara-charcoal">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        </div>
        <div className={clsx('p-3 rounded-xl', colorStyles[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={clsx('text-sm font-medium', trend >= 0 ? 'text-emerald-600' : 'text-red-600')}>
            {formatPercent(Math.abs(trend))}
          </span>
          <span className="text-sm text-neutral-500">dari bulan lalu</span>
        </div>
      )}
    </div>
  );
}

function BudgetProgressBar({ vendor, budget, actual, color }) {
  const percent = budget > 0 ? (actual / budget) * 100 : 0;
  const isOverBudget = percent > 100;

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm font-medium text-aksara-charcoal truncate" title={vendor}>
        {vendor}
      </div>
      <div className="flex-1">
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(percent, 100)}%`,
              backgroundColor: isOverBudget ? '#B6244F' : color || '#B89685',
            }}
          />
        </div>
      </div>
      <div className="w-32 text-right">
        <span className={clsx('text-sm font-medium', isOverBudget ? 'text-aksara-rose' : 'text-aksara-charcoal')}>
          {formatPercent(percent, 0)}
        </span>
        <span className="text-xs text-neutral-500 ml-1">
          ({formatCurrency(actual).replace('Rp', '').trim()})
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [year, setYear] = useState(2025);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary', year],
    queryFn: () => dashboardApi.getSummary(year),
  });

  const { data: monthlyTrend } = useQuery({
    queryKey: ['dashboard-monthly', year],
    queryFn: () => dashboardApi.getMonthlyTrend(year),
  });

  const { data: vendorDist } = useQuery({
    queryKey: ['dashboard-vendor-dist', year],
    queryFn: () => dashboardApi.getVendorDistribution(year),
  });

  const { data: budgetVsActual } = useQuery({
    queryKey: ['dashboard-budget-actual', year],
    queryFn: () => dashboardApi.getBudgetVsActual(year),
  });

  const { data: recentTx } = useQuery({
    queryKey: ['dashboard-recent-tx'],
    queryFn: () => dashboardApi.getRecentTransactions(5),
  });

  const COLORS = vendorDist?.distribution?.map(d => d.color) || ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-aksara-charcoal">Dashboard</h1>
          <p className="text-neutral-500">Ringkasan anggaran dan transaksi</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="select w-32 border-aksara-taupe/50 focus:border-aksara-rose focus:ring-aksara-rose/20"
        >
          {[2026, 2025, 2024, 2023].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Alert Banner */}
      {summary?.overdue?.count > 0 && (
        <div className="bg-gradient-to-r from-aksara-rose/10 to-aksara-blush/20 border border-aksara-rose/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-aksara-rose" />
          <div className="flex-1">
            <p className="text-sm font-medium text-aksara-rose">
              {summary.overdue.count} tagihan sudah melewati jatuh tempo
            </p>
            <p className="text-sm text-aksara-charcoal/70">
              Total: {formatCurrency(summary.overdue.total)}
            </p>
          </div>
          <Link to="/transaksi?status=overdue" className="btn bg-aksara-rose text-white hover:bg-aksara-rose/90 text-sm">
            Lihat
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Anggaran"
          value={formatCurrency(summary?.totalBudget || 0)}
          subtitle={`Tahun ${year}`}
          icon={DollarSign}
          color="rose"
        />
        <StatCard
          title="Realisasi"
          value={formatCurrency(summary?.totalRealization || 0)}
          subtitle={formatPercent(summary?.utilizationPercent || 0)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Sisa Anggaran"
          value={formatCurrency(summary?.remaining || 0)}
          subtitle={formatPercent(100 - (summary?.utilizationPercent || 0))}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Belum Dibayar"
          value={formatCurrency(summary?.pending?.total || 0)}
          subtitle={`${summary?.pending?.count || 0} transaksi`}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Jatuh Tempo"
          value={formatCurrency(summary?.overdue?.total || 0)}
          subtitle={`${summary?.overdue?.count || 0} transaksi`}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-aksara-charcoal mb-4">Distribusi per Vendor</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vendorDist?.distribution || []}
                  dataKey="total"
                  nameKey="short_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ short_name, percentage }) => `${short_name} ${percentage?.toFixed(0)}%`}
                  labelLine={false}
                >
                  {(vendorDist?.distribution || []).map((entry, index) => (
                    <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card p-6 lg:col-span-2 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-aksara-charcoal mb-4">Trend Bulanan {year}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend?.months || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000000000).toFixed(0)}M`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="paid" name="Dibayar" fill="#B6244F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#B89685" radius={[4, 4, 0, 0]} />
                <ReferenceLine
                  y={monthlyTrend?.monthlyBudget || 0}
                  stroke="#504746"
                  strokeDasharray="5 5"
                  label={{ value: 'Budget', position: 'right', fill: '#504746', fontSize: 12 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget vs Actual and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual */}
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-aksara-charcoal">Realisasi vs Anggaran</h3>
            <Link to="/anggaran" className="text-sm text-aksara-rose hover:text-aksara-rose/80 flex items-center gap-1">
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {(budgetVsActual?.data || []).slice(0, 6).map((item) => (
              <BudgetProgressBar
                key={item.vendor_id}
                vendor={item.short_name}
                budget={item.budget}
                actual={item.actual}
                color={item.color}
              />
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-aksara-charcoal">Transaksi Terbaru</h3>
            <Link to="/transaksi" className="text-sm text-aksara-rose hover:text-aksara-rose/80 flex items-center gap-1">
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {(recentTx || []).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tx.vendor_color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-aksara-charcoal">{tx.vendor_short_name}</p>
                    <p className="text-xs text-neutral-500">{tx.invoice_no}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-aksara-charcoal">{formatCurrency(tx.total)}</p>
                  <span className={clsx('badge', getStatusStyle(tx.status))}>
                    {getStatusLabel(tx.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
