-- ============================================================================
-- DATABASE SCHEMA FOR SISTEM ANGGARAN DIVISI TI
-- Bank SulutGo - Divisi Teknologi Informasi
-- ============================================================================

-- GL Accounts (Chart of Accounts)
CREATE TABLE IF NOT EXISTS gl_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vendors (Supplier/Mitra)
CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    npwp TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Services (Layanan)
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    monthly_fee DECIMAL(15,2) NOT NULL,
    type TEXT CHECK(type IN ('Software', 'Network', 'Infrastructure', 'Security')) NOT NULL,
    gl_account_id INTEGER,
    contract_number TEXT,
    contract_start DATE,
    contract_end DATE,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (gl_account_id) REFERENCES gl_accounts(id)
);

-- Transactions (Tagihan/Invoice)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    invoice_no TEXT UNIQUE NOT NULL,
    period TEXT NOT NULL,
    nominal DECIMAL(15,2) NOT NULL,
    ppn DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    status TEXT CHECK(status IN ('pending', 'approved', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
    invoice_date DATE NOT NULL,
    received_date DATE,
    due_date DATE NOT NULL,
    memo_date DATE,
    pay_date DATE,
    payment_ref TEXT,
    notes TEXT,
    attachment_path TEXT,
    created_by TEXT,
    approved_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Budgets (Anggaran)
CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    vendor_id INTEGER,
    service_id INTEGER,
    budget_amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    UNIQUE(year, vendor_id, service_id)
);

-- Settings (Pengaturan Aplikasi)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Network Assets (Aset Jaringan)
CREATE TABLE IF NOT EXISTS network_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL,
    location TEXT NOT NULL,
    service_type TEXT,
    product_name TEXT,
    site_name TEXT,
    bandwidth TEXT,
    mrc DECIMAL(15,2),
    contract_no TEXT,
    sia_no TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Cloud Servers (Server Cloud)
CREATE TABLE IF NOT EXISTS cloud_servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL,
    project_name TEXT,
    server_name TEXT NOT NULL,
    vcpu INTEGER,
    ram_gb INTEGER,
    storage_gb INTEGER,
    os TEXT,
    firewall TEXT,
    price DECIMAL(15,2),
    mrc DECIMAL(15,2),
    contract_no TEXT,
    sia_no TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    action TEXT CHECK(action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    old_values TEXT,
    new_values TEXT,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_period ON transactions(period);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_vendor ON transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_services_vendor ON services(vendor_id);
CREATE INDEX IF NOT EXISTS idx_budgets_year ON budgets(year);
CREATE INDEX IF NOT EXISTS idx_network_assets_vendor ON network_assets(vendor_id);
CREATE INDEX IF NOT EXISTS idx_cloud_servers_vendor ON cloud_servers(vendor_id);
