import { Router } from 'express';
import { z } from 'zod';
import db from '../db/database.js';

const router = Router();

const vendorSchema = z.object({
  name: z.string().min(1),
  short_name: z.string().min(1),
  color: z.string().optional().default('#3B82F6'),
  contact_person: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  npwp: z.string().optional(),
});

// Get all vendors with transaction summary
router.get('/', (req, res) => {
  try {
    const vendors = db.prepare(`
      SELECT
        v.*,
        COUNT(DISTINCT t.id) as transaction_count,
        COALESCE(SUM(t.total), 0) as total_transactions,
        COUNT(DISTINCT CASE WHEN t.status = 'paid' THEN t.id END) as paid_count,
        COUNT(DISTINCT CASE WHEN t.status IN ('pending', 'approved') THEN t.id END) as pending_count
      FROM vendors v
      LEFT JOIN transactions t ON v.id = t.vendor_id
      WHERE v.is_active = 1
      GROUP BY v.id
      ORDER BY v.name
    `).all();

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor by ID
router.get('/:id', (req, res) => {
  try {
    const vendor = db.prepare(`
      SELECT v.*,
        (SELECT COUNT(*) FROM transactions t WHERE t.vendor_id = v.id) as transaction_count,
        (SELECT COALESCE(SUM(total), 0) FROM transactions t WHERE t.vendor_id = v.id AND t.status = 'paid') as total_paid,
        (SELECT COALESCE(SUM(total), 0) FROM transactions t WHERE t.vendor_id = v.id AND t.status IN ('pending', 'approved')) as total_pending
      FROM vendors v
      WHERE v.id = ?
    `).get(req.params.id);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const services = db.prepare(`
      SELECT * FROM services WHERE vendor_id = ? AND is_active = 1
    `).all(req.params.id);

    const recentTransactions = db.prepare(`
      SELECT t.*, s.name as service_name
      FROM transactions t
      JOIN services s ON t.service_id = s.id
      WHERE t.vendor_id = ?
      ORDER BY t.invoice_date DESC
      LIMIT 10
    `).all(req.params.id);

    res.json({ ...vendor, services, recentTransactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create vendor
router.post('/', (req, res) => {
  try {
    const data = vendorSchema.parse(req.body);

    const result = db.prepare(`
      INSERT INTO vendors (name, short_name, color, contact_person, email, phone, address, npwp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.name, data.short_name, data.color, data.contact_person,
      data.email, data.phone, data.address, data.npwp
    );

    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(vendor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update vendor
router.put('/:id', (req, res) => {
  try {
    const data = vendorSchema.partial().parse(req.body);

    const existing = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Vendor not found' });
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

      db.prepare(`UPDATE vendors SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
    res.json(vendor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Soft delete vendor
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check for existing transactions
    const transactionCount = db.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE vendor_id = ?'
    ).get(req.params.id);

    if (transactionCount.count > 0) {
      // Soft delete
      db.prepare('UPDATE vendors SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(req.params.id);
      return res.json({ message: 'Vendor deactivated (has transactions)' });
    }

    // Hard delete if no transactions
    db.prepare('DELETE FROM vendors WHERE id = ?').run(req.params.id);
    res.json({ message: 'Vendor deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
