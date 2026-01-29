import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// Get all settings
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = {
        value: s.value,
        description: s.description,
        updated_at: s.updated_at,
      };
    });
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single setting
router.get('/:key', (req, res) => {
  try {
    const setting = db.prepare('SELECT * FROM settings WHERE key = ?').get(req.params.key);
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings (batch)
router.put('/', (req, res) => {
  try {
    const updates = req.body;

    if (typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ error: 'Expected object with key-value pairs' });
    }

    const upsert = db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    const upsertMany = db.transaction((entries) => {
      for (const [key, value] of entries) {
        upsert.run(key, String(value));
      }
    });

    upsertMany(Object.entries(updates));

    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = {
        value: s.value,
        description: s.description,
        updated_at: s.updated_at,
      };
    });

    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update single setting
router.put('/:key', (req, res) => {
  try {
    const { value, description } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    db.prepare(`
      INSERT INTO settings (key, value, description, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        description = COALESCE(excluded.description, settings.description),
        updated_at = CURRENT_TIMESTAMP
    `).run(req.params.key, String(value), description);

    const setting = db.prepare('SELECT * FROM settings WHERE key = ?').get(req.params.key);
    res.json(setting);
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

// Create GL account
router.post('/meta/gl-accounts', (req, res) => {
  try {
    const { code, name, category } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    const result = db.prepare(`
      INSERT INTO gl_accounts (code, name, category)
      VALUES (?, ?, ?)
    `).run(code, name, category);

    const account = db.prepare('SELECT * FROM gl_accounts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(account);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'GL account code already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
