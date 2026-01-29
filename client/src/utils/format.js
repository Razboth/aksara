// Format currency in Indonesian Rupiah
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number with Indonesian locale
export function formatNumber(num) {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('id-ID').format(num);
}

// Format date in Indonesian
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Format date long
export function formatDateLong(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Format period (YYYY-MM) to readable format
export function formatPeriod(period) {
  if (!period) return '-';
  const [year, month] = period.split('-');
  const date = new Date(year, parseInt(month) - 1, 1);
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

// Format percentage
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
}

// Get status badge style
export function getStatusStyle(status) {
  const styles = {
    paid: 'badge-success',
    pending: 'badge-warning',
    approved: 'badge-info',
    overdue: 'badge-danger',
    cancelled: 'badge-gray',
  };
  return styles[status] || 'badge-gray';
}

// Get status label in Indonesian
export function getStatusLabel(status) {
  const labels = {
    paid: 'Dibayar',
    pending: 'Menunggu',
    approved: 'Disetujui',
    overdue: 'Jatuh Tempo',
    cancelled: 'Dibatalkan',
  };
  return labels[status] || status;
}

// Calculate PPN
export function calculatePPN(nominal, rate = 0.11) {
  return Math.round(nominal * rate);
}

// Generate month options
export function getMonthOptions() {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return {
      value: String(i + 1).padStart(2, '0'),
      label: date.toLocaleDateString('id-ID', { month: 'long' }),
    };
  });
}

// Generate year options
export function getYearOptions(startYear = 2023, endYear = new Date().getFullYear() + 1) {
  const years = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push({ value: year, label: String(year) });
  }
  return years;
}
