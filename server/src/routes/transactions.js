import { Router } from 'express';
import { z } from 'zod';
import db from '../db/database.js';

const router = Router();

const transactionSchema = z.object({
  vendor_id: z.number().int().positive(),
  service_id: z.number().int().positive(),
  invoice_no: z.string().min(1),
  period: z.string().regex(/^\d{4}-\d{2}$/),
  nominal: z.number().min(0),
  ppn: z.number().min(0),
  total: z.number().min(0),
  status: z.enum(['pending', 'approved', 'paid', 'overdue', 'cancelled']).optional().default('pending'),
  invoice_date: z.string(),
  received_date: z.string().optional().nullable(),
  due_date: z.string(),
  memo_date: z.string().optional().nullable(),
  pay_date: z.string().optional().nullable(),
  payment_ref: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Get all transactions with filters
router.get('/', (req, res) => {
  try {
    const { vendor_id, service_id, status, period, year, search, page = 1, limit = 25, sort = 'invoice_date', order = 'desc' } = req.query;

    let query = `
      SELECT t.*, v.name as vendor_name, v.short_name as vendor_short_name, v.color as vendor_color,
             s.name as service_name, s.type as service_type
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN services s ON t.service_id = s.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM transactions t WHERE 1=1';
    const params = [];
    const countParams = [];

    if (vendor_id) {
      query += ' AND t.vendor_id = ?';
      countQuery += ' AND t.vendor_id = ?';
      params.push(vendor_id);
      countParams.push(vendor_id);
    }

    if (service_id) {
      query += ' AND t.service_id = ?';
      countQuery += ' AND t.service_id = ?';
      params.push(service_id);
      countParams.push(service_id);
    }

    if (status) {
      query += ' AND t.status = ?';
      countQuery += ' AND t.status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (period) {
      query += ' AND t.period = ?';
      countQuery += ' AND t.period = ?';
      params.push(period);
      countParams.push(period);
    }

    if (year) {
      query += ' AND t.period LIKE ?';
      countQuery += ' AND t.period LIKE ?';
      params.push(`${year}-%`);
      countParams.push(`${year}-%`);
    }

    if (search) {
      query += ' AND (t.invoice_no LIKE ? OR t.notes LIKE ?)';
      countQuery += ' AND (t.invoice_no LIKE ? OR t.notes LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern);
    }

    // Sorting
    const validSorts = ['invoice_date', 'due_date', 'total', 'status', 'vendor_name', 'period'];
    const sortColumn = validSorts.includes(sort) ? sort : 'invoice_date';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY t.${sortColumn} ${sortOrder}`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const transactions = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction by ID
router.get('/:id', (req, res) => {
  try {
    const transaction = db.prepare(`
      SELECT t.*, v.name as vendor_name, v.short_name as vendor_short_name, v.color as vendor_color,
             s.name as service_name, s.type as service_type, s.monthly_fee
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN services s ON t.service_id = s.id
      WHERE t.id = ?
    `).get(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
router.post('/', (req, res) => {
  try {
    const data = transactionSchema.parse(req.body);

    // Check if invoice_no already exists
    const existing = db.prepare('SELECT id FROM transactions WHERE invoice_no = ?').get(data.invoice_no);
    if (existing) {
      return res.status(400).json({ error: 'Invoice number already exists' });
    }

    // Verify vendor and service exist
    const vendor = db.prepare('SELECT id FROM vendors WHERE id = ?').get(data.vendor_id);
    if (!vendor) {
      return res.status(400).json({ error: 'Vendor not found' });
    }

    const service = db.prepare('SELECT id FROM services WHERE id = ? AND vendor_id = ?').get(data.service_id, data.vendor_id);
    if (!service) {
      return res.status(400).json({ error: 'Service not found or does not belong to vendor' });
    }

    const result = db.prepare(`
      INSERT INTO transactions (vendor_id, service_id, invoice_no, period, nominal, ppn, total, status, invoice_date, received_date, due_date, memo_date, pay_date, payment_ref, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.vendor_id, data.service_id, data.invoice_no, data.period,
      data.nominal, data.ppn, data.total, data.status,
      data.invoice_date, data.received_date, data.due_date,
      data.memo_date, data.pay_date, data.payment_ref, data.notes
    );

    const transaction = db.prepare(`
      SELECT t.*, v.name as vendor_name, s.name as service_name
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN services s ON t.service_id = s.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update transaction
router.put('/:id', (req, res) => {
  try {
    const data = transactionSchema.partial().parse(req.body);

    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check invoice_no uniqueness if changed
    if (data.invoice_no && data.invoice_no !== existing.invoice_no) {
      const duplicate = db.prepare('SELECT id FROM transactions WHERE invoice_no = ? AND id != ?')
        .get(data.invoice_no, req.params.id);
      if (duplicate) {
        return res.status(400).json({ error: 'Invoice number already exists' });
      }
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

      db.prepare(`UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const transaction = db.prepare(`
      SELECT t.*, v.name as vendor_name, s.name as service_name
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN services s ON t.service_id = s.id
      WHERE t.id = ?
    `).get(req.params.id);

    res.json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update status only
router.patch('/:id/status', (req, res) => {
  try {
    const { status, pay_date, payment_ref } = req.body;

    if (!['pending', 'approved', 'paid', 'overdue', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    let query = 'UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status];

    if (status === 'paid' && pay_date) {
      query += ', pay_date = ?';
      params.push(pay_date);
    }

    if (payment_ref) {
      query += ', payment_ref = ?';
      params.push(payment_ref);
    }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    db.prepare(query).run(...params);

    const transaction = db.prepare(`
      SELECT t.*, v.name as vendor_name, s.name as service_name
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN services s ON t.service_id = s.id
      WHERE t.id = ?
    `).get(req.params.id);

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk update status
router.patch('/bulk/status', (req, res) => {
  try {
    const { ids, status, pay_date } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs array required' });
    }

    if (!['pending', 'approved', 'paid', 'overdue', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const placeholders = ids.map(() => '?').join(',');
    let query = `UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP`;
    const params = [status];

    if (status === 'paid' && pay_date) {
      query += ', pay_date = ?';
      params.push(pay_date);
    }

    query += ` WHERE id IN (${placeholders})`;
    params.push(...ids);

    const result = db.prepare(query).run(...params);

    res.json({ updated: result.changes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete transaction
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark overdue transactions
router.post('/mark-overdue', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = db.prepare(`
      UPDATE transactions
      SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
      WHERE status IN ('pending', 'approved')
      AND due_date < ?
    `).run(today);

    res.json({ updated: result.changes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
