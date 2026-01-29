import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// Get all notifications
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT value FROM settings WHERE key = ?').get('reminder_days_before');
    const reminderDays = parseInt(settings?.value || '7');

    // Get overdue transactions
    const overdue = db.prepare(`
      SELECT t.*, v.name as vendor_name, v.short_name as vendor_short_name, v.color as vendor_color,
             s.name as service_name
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN services s ON t.service_id = s.id
      WHERE t.status IN ('pending', 'approved', 'overdue')
      AND t.due_date < date('now')
      ORDER BY t.due_date ASC
    `).all();

    // Get due soon transactions
    const dueSoon = db.prepare(`
      SELECT t.*, v.name as vendor_name, v.short_name as vendor_short_name, v.color as vendor_color,
             s.name as service_name,
             julianday(t.due_date) - julianday('now') as days_until_due
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN services s ON t.service_id = s.id
      WHERE t.status IN ('pending', 'approved')
      AND t.due_date BETWEEN date('now') AND date('now', '+' || ? || ' days')
      ORDER BY t.due_date ASC
    `).all(reminderDays);

    // Get over-budget warnings
    const year = new Date().getFullYear();
    const overBudget = db.prepare(`
      SELECT
        v.id as vendor_id,
        v.name as vendor_name,
        v.short_name,
        v.color,
        COALESCE(b.budget_amount, 0) as budget,
        COALESCE(SUM(t.total), 0) as actual
      FROM vendors v
      LEFT JOIN budgets b ON v.id = b.vendor_id AND b.year = ?
      LEFT JOIN transactions t ON v.id = t.vendor_id AND t.period LIKE ?
      WHERE v.is_active = 1
      GROUP BY v.id
      HAVING budget > 0 AND actual > budget * 0.8
      ORDER BY (actual / budget) DESC
    `).all(year, `${year}-%`);

    const notifications = [
      ...overdue.map(t => ({
        id: `overdue-${t.id}`,
        type: 'overdue',
        severity: 'error',
        title: 'Tagihan Jatuh Tempo',
        message: `${t.vendor_short_name}: ${t.invoice_no} jatuh tempo ${Math.abs(Math.floor((new Date(t.due_date) - new Date()) / (1000 * 60 * 60 * 24)))} hari yang lalu`,
        data: t,
        created_at: t.due_date,
      })),
      ...dueSoon.map(t => ({
        id: `due-soon-${t.id}`,
        type: 'due_soon',
        severity: 'warning',
        title: 'Tagihan Akan Jatuh Tempo',
        message: `${t.vendor_short_name}: ${t.invoice_no} jatuh tempo dalam ${Math.ceil(t.days_until_due)} hari`,
        data: t,
        created_at: new Date().toISOString(),
      })),
      ...overBudget.map(item => {
        const percent = (item.actual / item.budget) * 100;
        const isOver = percent >= 100;
        return {
          id: `budget-${item.vendor_id}`,
          type: isOver ? 'over_budget' : 'budget_warning',
          severity: isOver ? 'error' : 'warning',
          title: isOver ? 'Anggaran Terlampaui' : 'Peringatan Anggaran',
          message: `${item.short_name}: Realisasi ${percent.toFixed(0)}% dari anggaran`,
          data: item,
          created_at: new Date().toISOString(),
        };
      }),
    ];

    // Sort by severity and date
    notifications.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification count
router.get('/count', (req, res) => {
  try {
    const settings = db.prepare('SELECT value FROM settings WHERE key = ?').get('reminder_days_before');
    const reminderDays = parseInt(settings?.value || '7');

    const overdueCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM transactions
      WHERE status IN ('pending', 'approved', 'overdue')
      AND due_date < date('now')
    `).get();

    const dueSoonCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM transactions
      WHERE status IN ('pending', 'approved')
      AND due_date BETWEEN date('now') AND date('now', '+' || ? || ' days')
    `).get(reminderDays);

    const year = new Date().getFullYear();
    const overBudgetCount = db.prepare(`
      SELECT COUNT(*) as count FROM (
        SELECT v.id
        FROM vendors v
        LEFT JOIN budgets b ON v.id = b.vendor_id AND b.year = ?
        LEFT JOIN transactions t ON v.id = t.vendor_id AND t.period LIKE ?
        WHERE v.is_active = 1
        GROUP BY v.id
        HAVING COALESCE(b.budget_amount, 0) > 0
        AND COALESCE(SUM(t.total), 0) > COALESCE(b.budget_amount, 0) * 0.8
      )
    `).get(year, `${year}-%`);

    res.json({
      overdue: overdueCount.count,
      dueSoon: dueSoonCount.count,
      overBudget: overBudgetCount.count,
      total: overdueCount.count + dueSoonCount.count + overBudgetCount.count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
