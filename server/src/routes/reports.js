import { Router } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import db from '../db/database.js';

const router = Router();

// Format currency for Indonesia
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date for Indonesia
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Export transactions to CSV
router.get('/transactions/csv', (req, res) => {
  try {
    const { vendor_id, status, year, period } = req.query;

    let query = `
      SELECT t.*, v.name as vendor_name, v.short_name as vendor_short_name,
             s.name as service_name
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN services s ON t.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (vendor_id) {
      query += ' AND t.vendor_id = ?';
      params.push(vendor_id);
    }
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (year) {
      query += ' AND t.period LIKE ?';
      params.push(`${year}-%`);
    }
    if (period) {
      query += ' AND t.period = ?';
      params.push(period);
    }

    query += ' ORDER BY t.invoice_date DESC';

    const transactions = db.prepare(query).all(...params);

    // CSV header
    const headers = [
      'No Invoice', 'Vendor', 'Layanan', 'Periode', 'Nominal', 'PPN', 'Total',
      'Status', 'Tgl Invoice', 'Tgl Jatuh Tempo', 'Tgl Bayar', 'Catatan'
    ];

    let csv = headers.join(',') + '\n';

    transactions.forEach(t => {
      const row = [
        `"${t.invoice_no}"`,
        `"${t.vendor_name}"`,
        `"${t.service_name}"`,
        t.period,
        t.nominal,
        t.ppn,
        t.total,
        t.status,
        t.invoice_date,
        t.due_date,
        t.pay_date || '',
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ];
      csv += row.join(',') + '\n';
    });

    const filename = `transaksi_${year || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\ufeff' + csv); // BOM for Excel compatibility
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export transactions to Excel
router.get('/transactions/excel', async (req, res) => {
  try {
    const { vendor_id, status, year, period } = req.query;

    let query = `
      SELECT t.*, v.name as vendor_name, v.short_name as vendor_short_name,
             s.name as service_name
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN services s ON t.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (vendor_id) {
      query += ' AND t.vendor_id = ?';
      params.push(vendor_id);
    }
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (year) {
      query += ' AND t.period LIKE ?';
      params.push(`${year}-%`);
    }
    if (period) {
      query += ' AND t.period = ?';
      params.push(period);
    }

    query += ' ORDER BY t.invoice_date DESC';

    const transactions = db.prepare(query).all(...params);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistem Anggaran Divisi TI';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Transaksi');

    // Title
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Laporan Transaksi ${year || 'Semua Tahun'}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:L2');
    worksheet.getCell('A2').value = `Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Headers
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      'No', 'No Invoice', 'Vendor', 'Layanan', 'Periode', 'Nominal', 'PPN', 'Total',
      'Status', 'Tgl Invoice', 'Tgl Jatuh Tempo', 'Tgl Bayar'
    ]);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3B82F6' },
      };
      cell.font = { color: { argb: 'FFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Data rows
    let totalNominal = 0;
    let totalPPN = 0;
    let totalAmount = 0;

    transactions.forEach((t, index) => {
      const row = worksheet.addRow([
        index + 1,
        t.invoice_no,
        t.vendor_name,
        t.service_name,
        t.period,
        t.nominal,
        t.ppn,
        t.total,
        t.status.toUpperCase(),
        formatDate(t.invoice_date),
        formatDate(t.due_date),
        formatDate(t.pay_date),
      ]);

      totalNominal += t.nominal;
      totalPPN += t.ppn;
      totalAmount += t.total;

      // Format currency columns
      row.getCell(6).numFmt = '#,##0';
      row.getCell(7).numFmt = '#,##0';
      row.getCell(8).numFmt = '#,##0';

      // Status color
      const statusCell = row.getCell(9);
      const statusColors = {
        paid: '10B981',
        pending: 'F59E0B',
        approved: '3B82F6',
        overdue: 'EF4444',
        cancelled: '6B7280',
      };
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusColors[t.status] || 'FFFFFF' },
      };
      statusCell.font = { color: { argb: 'FFFFFF' }, bold: true };

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Total row
    const totalRow = worksheet.addRow([
      '', '', '', '', 'TOTAL', totalNominal, totalPPN, totalAmount, '', '', '', ''
    ]);
    totalRow.font = { bold: true };
    totalRow.getCell(6).numFmt = '#,##0';
    totalRow.getCell(7).numFmt = '#,##0';
    totalRow.getCell(8).numFmt = '#,##0';

    // Column widths
    worksheet.columns = [
      { width: 5 }, { width: 25 }, { width: 30 }, { width: 35 }, { width: 12 },
      { width: 18 }, { width: 15 }, { width: 18 }, { width: 12 },
      { width: 15 }, { width: 15 }, { width: 15 },
    ];

    const filename = `transaksi_${year || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export budget report to Excel
router.get('/budget/excel', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const yearPattern = `${year}-%`;

    const data = db.prepare(`
      SELECT
        v.id as vendor_id,
        v.name as vendor_name,
        v.short_name,
        COALESCE(b.budget_amount, 0) as budget,
        COALESCE(SUM(t.total), 0) as actual,
        COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.total ELSE 0 END), 0) as paid,
        COALESCE(SUM(CASE WHEN t.status IN ('pending', 'approved') THEN t.total ELSE 0 END), 0) as pending,
        COUNT(t.id) as transaction_count
      FROM vendors v
      LEFT JOIN budgets b ON v.id = b.vendor_id AND b.year = ?
      LEFT JOIN transactions t ON v.id = t.vendor_id AND t.period LIKE ?
      WHERE v.is_active = 1
      GROUP BY v.id
      HAVING budget > 0 OR actual > 0
      ORDER BY budget DESC
    `).all(year, yearPattern);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Anggaran vs Realisasi');

    // Title
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Laporan Anggaran vs Realisasi Tahun ${year}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:H2');
    worksheet.getCell('A2').value = `Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    // Headers
    const headerRow = worksheet.addRow([
      'No', 'Vendor', 'Anggaran', 'Realisasi', 'Dibayar', 'Pending', 'Sisa', '% Realisasi'
    ]);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3B82F6' },
      };
      cell.font = { color: { argb: 'FFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center' };
    });

    let totalBudget = 0;
    let totalActual = 0;
    let totalPaid = 0;
    let totalPending = 0;

    data.forEach((item, index) => {
      const remaining = item.budget - item.actual;
      const percent = item.budget > 0 ? (item.actual / item.budget) * 100 : 0;

      const row = worksheet.addRow([
        index + 1,
        item.vendor_name,
        item.budget,
        item.actual,
        item.paid,
        item.pending,
        remaining,
        percent.toFixed(1) + '%',
      ]);

      totalBudget += item.budget;
      totalActual += item.actual;
      totalPaid += item.paid;
      totalPending += item.pending;

      // Format currency columns
      [3, 4, 5, 6, 7].forEach(col => {
        row.getCell(col).numFmt = '#,##0';
      });

      // Color code based on utilization
      if (percent > 100) {
        row.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
      } else if (percent > 80) {
        row.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
      }
    });

    // Total row
    const totalPercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
    const totalRow = worksheet.addRow([
      '', 'TOTAL', totalBudget, totalActual, totalPaid, totalPending,
      totalBudget - totalActual, totalPercent.toFixed(1) + '%'
    ]);
    totalRow.font = { bold: true };
    [3, 4, 5, 6, 7].forEach(col => {
      totalRow.getCell(col).numFmt = '#,##0';
    });

    worksheet.columns = [
      { width: 5 }, { width: 35 }, { width: 20 }, { width: 20 },
      { width: 20 }, { width: 20 }, { width: 20 }, { width: 15 },
    ];

    const filename = `anggaran_${year}_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate PDF for single transaction
router.get('/transactions/:id/pdf', (req, res) => {
  try {
    const transaction = db.prepare(`
      SELECT t.*, v.name as vendor_name, v.short_name as vendor_short_name, v.address as vendor_address,
             v.npwp as vendor_npwp, s.name as service_name
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN services s ON t.service_id = s.id
      WHERE t.id = ?
    `).get(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const settings = db.prepare('SELECT key, value FROM settings').all();
    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${transaction.invoice_no}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text(settingsMap.company_name || 'Bank SulutGo', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(settingsMap.division_name || 'Divisi Teknologi Informasi', { align: 'center' });
    doc.moveDown();

    // Title
    doc.fontSize(16).font('Helvetica-Bold').text('BUKTI PEMBAYARAN', { align: 'center' });
    doc.moveDown();

    // Invoice details
    doc.fontSize(10).font('Helvetica');
    doc.text(`No. Invoice: ${transaction.invoice_no}`);
    doc.text(`Tanggal: ${formatDate(transaction.invoice_date)}`);
    doc.text(`Jatuh Tempo: ${formatDate(transaction.due_date)}`);
    doc.text(`Status: ${transaction.status.toUpperCase()}`);
    doc.moveDown();

    // Vendor info
    doc.font('Helvetica-Bold').text('Vendor:');
    doc.font('Helvetica').text(transaction.vendor_name);
    if (transaction.vendor_address) doc.text(transaction.vendor_address);
    if (transaction.vendor_npwp) doc.text(`NPWP: ${transaction.vendor_npwp}`);
    doc.moveDown();

    // Service details
    doc.font('Helvetica-Bold').text('Detail Layanan:');
    doc.font('Helvetica').text(transaction.service_name);
    doc.text(`Periode: ${transaction.period}`);
    doc.moveDown();

    // Amount table
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Deskripsi', 50, tableTop);
    doc.text('Jumlah', 400, tableTop, { width: 100, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    doc.font('Helvetica');
    doc.text('Nominal', 50, tableTop + 25);
    doc.text(formatCurrency(transaction.nominal), 400, tableTop + 25, { width: 100, align: 'right' });

    doc.text('PPN', 50, tableTop + 45);
    doc.text(formatCurrency(transaction.ppn), 400, tableTop + 45, { width: 100, align: 'right' });

    doc.moveTo(50, tableTop + 60).lineTo(550, tableTop + 60).stroke();

    doc.font('Helvetica-Bold');
    doc.text('TOTAL', 50, tableTop + 70);
    doc.text(formatCurrency(transaction.total), 400, tableTop + 70, { width: 100, align: 'right' });

    doc.moveTo(50, tableTop + 85).lineTo(550, tableTop + 85).stroke();

    // Payment info if paid
    if (transaction.pay_date) {
      doc.moveDown(3);
      doc.font('Helvetica').text(`Tanggal Bayar: ${formatDate(transaction.pay_date)}`);
      if (transaction.payment_ref) {
        doc.text(`Referensi Pembayaran: ${transaction.payment_ref}`);
      }
    }

    // Notes
    if (transaction.notes) {
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Catatan:');
      doc.font('Helvetica').text(transaction.notes);
    }

    // Footer
    doc.moveDown(3);
    doc.fontSize(8).text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
