import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// Get dashboard summary
router.get('/summary', (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const yearPattern = `${year}-%`;

    // Total budget for year
    const budgetResult = db.prepare(`
      SELECT COALESCE(SUM(budget_amount), 0) as total
      FROM budgets WHERE year = ?
    `).get(year);

    // Realization (paid transactions)
    const paidResult = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE period LIKE ? AND status = 'paid'
    `).get(yearPattern);

    // Pending transactions
    const pendingResult = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count
      FROM transactions
      WHERE period LIKE ? AND status IN ('pending', 'approved')
    `).get(yearPattern);

    // Overdue transactions
    const overdueResult = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count
      FROM transactions
      WHERE status = 'overdue' OR (status IN ('pending', 'approved') AND due_date < date('now'))
    `).get();

    // Due soon (within 7 days)
    const dueSoonResult = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count
      FROM transactions
      WHERE status IN ('pending', 'approved')
      AND due_date BETWEEN date('now') AND date('now', '+7 days')
    `).get();

    const totalBudget = budgetResult.total;
    const totalRealization = paidResult.total;
    const remaining = totalBudget - totalRealization;
    const utilizationPercent = totalBudget > 0 ? (totalRealization / totalBudget) * 100 : 0;

    res.json({
      year: parseInt(year),
      totalBudget,
      totalRealization,
      remaining,
      utilizationPercent,
      pending: {
        total: pendingResult.total,
        count: pendingResult.count,
      },
      overdue: {
        total: overdueResult.total,
        count: overdueResult.count,
      },
      dueSoon: {
        total: dueSoonResult.total,
        count: dueSoonResult.count,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly trend
router.get('/monthly-trend', (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const yearPattern = `${year}-%`;

    const monthlyData = db.prepare(`
      SELECT
        period,
        SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) as paid,
        SUM(CASE WHEN status IN ('pending', 'approved') THEN total ELSE 0 END) as pending,
        SUM(total) as total,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE period LIKE ?
      GROUP BY period
      ORDER BY period
    `).all(yearPattern);

    // Fill in missing months
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const period = `${year}-${String(m).padStart(2, '0')}`;
      const existing = monthlyData.find(d => d.period === period);
      months.push({
        period,
        month: m,
        monthName: new Date(year, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' }),
        paid: existing?.paid || 0,
        pending: existing?.pending || 0,
        total: existing?.total || 0,
        transaction_count: existing?.transaction_count || 0,
      });
    }

    // Get monthly budget average
    const budgetResult = db.prepare(`
      SELECT COALESCE(SUM(budget_amount), 0) as total
      FROM budgets WHERE year = ?
    `).get(year);
    const monthlyBudget = budgetResult.total / 12;

    res.json({
      year: parseInt(year),
      months,
      monthlyBudget,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor distribution
router.get('/vendor-distribution', (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const yearPattern = `${year}-%`;

    const distribution = db.prepare(`
      SELECT
        v.id as vendor_id,
        v.name as vendor_name,
        v.short_name,
        v.color,
        COALESCE(SUM(t.total), 0) as total,
        COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.total ELSE 0 END), 0) as paid,
        COALESCE(SUM(CASE WHEN t.status IN ('pending', 'approved') THEN t.total ELSE 0 END), 0) as pending,
        COUNT(t.id) as transaction_count
      FROM vendors v
      LEFT JOIN transactions t ON v.id = t.vendor_id AND t.period LIKE ?
      WHERE v.is_active = 1
      GROUP BY v.id
      HAVING total > 0
      ORDER BY total DESC
    `).all(yearPattern);

    const grandTotal = distribution.reduce((sum, d) => sum + d.total, 0);

    res.json({
      year: parseInt(year),
      distribution: distribution.map(d => ({
        ...d,
        percentage: grandTotal > 0 ? (d.total / grandTotal) * 100 : 0,
      })),
      grandTotal,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get budget vs actual per vendor
router.get('/budget-vs-actual', (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const yearPattern = `${year}-%`;

    const data = db.prepare(`
      SELECT
        v.id as vendor_id,
        v.name as vendor_name,
        v.short_name,
        v.color,
        COALESCE(b.budget_amount, 0) as budget,
        COALESCE(SUM(t.total), 0) as actual,
        COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.total ELSE 0 END), 0) as paid,
        COUNT(t.id) as transaction_count
      FROM vendors v
      LEFT JOIN budgets b ON v.id = b.vendor_id AND b.year = ?
      LEFT JOIN transactions t ON v.id = t.vendor_id AND t.period LIKE ?
      WHERE v.is_active = 1
      GROUP BY v.id
      HAVING budget > 0 OR actual > 0
      ORDER BY budget DESC
    `).all(year, yearPattern);

    res.json({
      year: parseInt(year),
      data: data.map(d => ({
        ...d,
        remaining: d.budget - d.actual,
        utilizationPercent: d.budget > 0 ? (d.actual / d.budget) * 100 : 0,
        isOverBudget: d.actual > d.budget,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent transactions
router.get('/recent-transactions', (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const transactions = db.prepare(`
      SELECT t.*, v.name as vendor_name, v.short_name as vendor_short_name, v.color as vendor_color,
             s.name as service_name
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN services s ON t.service_id = s.id
      ORDER BY t.created_at DESC
      LIMIT ?
    `).all(parseInt(limit));

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
