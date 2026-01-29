import { Router } from 'express';
import { z } from 'zod';
import db from '../db/database.js';

const router = Router();

const serviceSchema = z.object({
  vendor_id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().optional(),
  monthly_fee: z.number().min(0),
  type: z.enum(['Software', 'Network', 'Infrastructure', 'Security']),
  gl_account_id: z.number().int().positive().optional(),
  contract_number: z.string().optional(),
  contract_start: z.string().optional(),
  contract_end: z.string().optional(),
});

// Get all services
router.get('/', (req, res) => {
  try {
    const { vendor_id, type, is_active } = req.query;

    let query = `
      SELECT s.*, v.name as vendor_name, v.short_name as vendor_short_name, v.color as vendor_color,
             g.code as gl_code, g.name as gl_name
      FROM services s
      JOIN vendors v ON s.vendor_id = v.id
      LEFT JOIN gl_accounts g ON s.gl_account_id = g.id
      WHERE 1=1
    `;
    const params = [];

    if (vendor_id) {
      query += ' AND s.vendor_id = ?';
      params.push(vendor_id);
    }

    if (type) {
      query += ' AND s.type = ?';
      params.push(type);
    }

    if (is_active !== undefined) {
      query += ' AND s.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    } else {
      query += ' AND s.is_active = 1';
    }

    query += ' ORDER BY v.name, s.name';

    const services = db.prepare(query).all(...params);
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get service by ID
router.get('/:id', (req, res) => {
  try {
    const service = db.prepare(`
      SELECT s.*, v.name as vendor_name, v.short_name as vendor_short_name,
             g.code as gl_code, g.name as gl_name
      FROM services s
      JOIN vendors v ON s.vendor_id = v.id
      LEFT JOIN gl_accounts g ON s.gl_account_id = g.id
      WHERE s.id = ?
    `).get(req.params.id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create service
router.post('/', (req, res) => {
  try {
    const data = serviceSchema.parse(req.body);

    // Verify vendor exists
    const vendor = db.prepare('SELECT id FROM vendors WHERE id = ?').get(data.vendor_id);
    if (!vendor) {
      return res.status(400).json({ error: 'Vendor not found' });
    }

    const result = db.prepare(`
      INSERT INTO services (vendor_id, name, description, monthly_fee, type, gl_account_id, contract_number, contract_start, contract_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.vendor_id, data.name, data.description, data.monthly_fee, data.type,
      data.gl_account_id, data.contract_number, data.contract_start, data.contract_end
    );

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update service
router.put('/:id', (req, res) => {
  try {
    const data = serviceSchema.partial().parse(req.body);

    const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Service not found' });
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

      db.prepare(`UPDATE services SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    res.json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete service
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check for existing transactions
    const transactionCount = db.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE service_id = ?'
    ).get(req.params.id);

    if (transactionCount.count > 0) {
      // Soft delete
      db.prepare('UPDATE services SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(req.params.id);
      return res.json({ message: 'Service deactivated (has transactions)' });
    }

    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get GL accounts
router.get('/meta/gl-accounts', (req, res) => {
  try {
    const accounts = db.prepare('SELECT * FROM gl_accounts ORDER BY code').all();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
