import { Router } from 'express';
import { z } from 'zod';
import db from '../db/database.js';

const router = Router();

const budgetSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  vendor_id: z.number().int().positive().optional().nullable(),
  service_id: z.number().int().positive().optional().nullable(),
  budget_amount: z.number().min(0),
  description: z.string().optional(),
});

// Get all budgets
router.get('/', (req, res) => {
  try {
    const { year } = req.query;

    let query = `
      SELECT b.*, v.name as vendor_name, v.short_name as vendor_short_name, v.color as vendor_color,
             s.name as service_name
      FROM budgets b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (year) {
      query += ' AND b.year = ?';
      params.push(year);
    }

    query += ' ORDER BY b.year DESC, v.name';

    const budgets = db.prepare(query).all(...params);
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get budget summary by year
router.get('/:year', (req, res) => {
  try {
    const year = parseInt(req.params.year);

    const budgets = db.prepare(`
      SELECT b.*, v.name as vendor_name, v.short_name as vendor_short_name, v.color as vendor_color
      FROM budgets b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE b.year = ?
      ORDER BY v.name
    `).all(year);

    const totalBudget = budgets.reduce((sum, b) => sum + b.budget_amount, 0);

    res.json({
      year,
      budgets,
      totalBudget,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get budget vs actual comparison
router.get('/:year/vs-actual', (req, res) => {
  try {
    const year = parseInt(req.params.year);

    const comparison = db.prepare(`
      SELECT
        b.id,
        b.year,
        b.budget_amount,
        b.description,
        v.id as vendor_id,
        v.name as vendor_name,
        v.short_name as vendor_short_name,
        v.color as vendor_color,
        COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.total ELSE 0 END), 0) as actual_paid,
        COALESCE(SUM(CASE WHEN t.status IN ('pending', 'approved') THEN t.total ELSE 0 END), 0) as actual_pending,
        COALESCE(SUM(t.total), 0) as actual_total,
        COUNT(t.id) as transaction_count
      FROM budgets b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      LEFT JOIN transactions t ON t.vendor_id = v.id AND t.period LIKE ?
      WHERE b.year = ?
      GROUP BY b.id
      ORDER BY v.name
    `).all(`${year}-%`, year);

    const summary = comparison.reduce(
      (acc, item) => {
        acc.totalBudget += item.budget_amount;
        acc.totalPaid += item.actual_paid;
        acc.totalPending += item.actual_pending;
        acc.totalActual += item.actual_total;
        return acc;
      },
      { totalBudget: 0, totalPaid: 0, totalPending: 0, totalActual: 0 }
    );

    summary.remaining = summary.totalBudget - summary.totalActual;
    summary.utilizationPercent = summary.totalBudget > 0
      ? (summary.totalActual / summary.totalBudget) * 100
      : 0;

    res.json({
      year,
      comparison: comparison.map(item => ({
        ...item,
        remaining: item.budget_amount - item.actual_total,
        utilizationPercent: item.budget_amount > 0
          ? (item.actual_total / item.budget_amount) * 100
          : 0,
      })),
      summary,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update budget
router.post('/', (req, res) => {
  try {
    const data = budgetSchema.parse(req.body);

    // Check if budget already exists
    const existing = db.prepare(`
      SELECT id FROM budgets
      WHERE year = ? AND vendor_id IS ? AND service_id IS ?
    `).get(data.year, data.vendor_id || null, data.service_id || null);

    if (existing) {
      // Update existing
      db.prepare(`
        UPDATE budgets
        SET budget_amount = ?, description = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(data.budget_amount, data.description, existing.id);

      const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(existing.id);
      return res.json(budget);
    }

    // Create new
    const result = db.prepare(`
      INSERT INTO budgets (year, vendor_id, service_id, budget_amount, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.year, data.vendor_id, data.service_id, data.budget_amount, data.description);

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(budget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update budget
router.put('/:id', (req, res) => {
  try {
    const data = budgetSchema.partial().parse(req.body);

    const existing = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const updates = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(req.params.id);

      db.prepare(`UPDATE budgets SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
    res.json(budget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete budget
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id);
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available years
router.get('/meta/years', (req, res) => {
  try {
    const years = db.prepare(`
      SELECT DISTINCT year FROM budgets
      UNION
      SELECT DISTINCT CAST(substr(period, 1, 4) AS INTEGER) as year FROM transactions
      ORDER BY year DESC
    `).all();

    res.json(years.map(y => y.year));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
