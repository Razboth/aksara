-- ============================================================================
-- SEED DATA FOR SISTEM ANGGARAN DIVISI TI
-- Source: Excel files from Bank SulutGo IT Division
-- ============================================================================

-- Clear existing data
DELETE FROM audit_log;
DELETE FROM cloud_servers;
DELETE FROM network_assets;
DELETE FROM transactions;
DELETE FROM budgets;
DELETE FROM services;
DELETE FROM vendors;
DELETE FROM gl_accounts;
DELETE FROM settings;

-- ============================================================================
-- 1. VENDORS (SUPPLIER/MITRA)
-- ============================================================================
INSERT INTO vendors (id, name, short_name, color, contact_person, email, phone, address, npwp) VALUES
(1, 'PT. Collega Inti Pratama', 'Collega', '#F59E0B', 'Admin Collega', 'admin@collega.co.id', '021-12345678', 'Jakarta', '01.234.567.8-012.000'),
(2, 'PT. Artajasa Pembayaran Elektronis', 'Artajasa', '#10B981', 'Admin Artajasa', 'admin@artajasa.co.id', '021-87654321', 'Jakarta', '02.345.678.9-012.000'),
(3, 'PT. Lintasarta', 'Lintasarta', '#3B82F6', 'Admin Lintasarta', 'admin@lintasarta.co.id', '021-11223344', 'Jakarta', '03.456.789.0-012.000'),
(4, 'PT. Metalogix', 'Metalogix', '#8B5CF6', 'Admin Metalogix', 'admin@metalogix.co.id', '021-22334455', 'Jakarta', '04.567.890.1-012.000'),
(5, 'PT. eMobile Indonesia', 'eMobile', '#EC4899', 'Admin eMobile', 'admin@emobile.co.id', '021-33445566', 'Jakarta', '05.678.901.2-012.000'),
(6, 'PT. Metrocom', 'Metrocom', '#14B8A6', 'Admin Metrocom', 'admin@metrocom.co.id', '021-44556677', 'Jakarta', '06.789.012.3-012.000'),
(7, 'PT. SPS', 'SPS', '#F97316', 'Admin SPS', 'admin@sps.co.id', '021-55667788', 'Jakarta', '07.890.123.4-012.000'),
(8, 'PT. Tangara', 'Tangara', '#06B6D4', 'Admin Tangara', 'admin@tangara.co.id', '021-66778899', 'Jakarta', '08.901.234.5-012.000'),
(9, 'PT. Telkomsat', 'Telkomsat', '#84CC16', 'Admin Telkomsat', 'admin@telkomsat.co.id', '021-77889900', 'Jakarta', '09.012.345.6-012.000');

-- ============================================================================
-- 2. GL ACCOUNTS (CHART OF ACCOUNTS)
-- ============================================================================
INSERT INTO gl_accounts (id, code, name, category) VALUES
(1, '5400102', 'Biaya Sewa IT', 'Operating Expense'),
(2, '5400101', 'Jaringan Komunikasi Online', 'Operating Expense'),
(3, '5480104', 'Beban Transaksi E-Channel', 'Operating Expense');

-- ============================================================================
-- 3. SERVICES (LAYANAN)
-- ============================================================================
INSERT INTO services (id, vendor_id, name, description, monthly_fee, type, gl_account_id, is_active) VALUES
-- PT. Collega Inti Pratama Services
(1, 1, 'Jasa Outsourcing Aplikasi Corebanking Sistem OLIBS 724', 'Layanan core banking system termasuk DC dan DRC', 1024000000, 'Software', 1, 1),
(2, 1, 'Jasa Outsourcing Aplikasi MIS/Data Warehouse', 'Layanan MIS dan Data Warehouse', 117000000, 'Software', 1, 1),
(3, 1, 'Layanan Sistem Aplikasi PSAK 71', 'Aplikasi untuk pelaporan PSAK 71', 67000000, 'Software', 1, 1),
(4, 1, 'Layanan Aplikasi Mobile Banking (BSGtouch)', 'Aplikasi mobile banking', 15000000, 'Software', 1, 1),
(5, 1, 'Layanan Aplikasi APU PPT', 'Aplikasi Anti Pencucian Uang', 15000000, 'Software', 1, 1),

-- PT. Artajasa Services
(6, 2, 'ATM Bersama', 'Layanan jaringan ATM Bersama', 20000000, 'Network', 1, 1),
(7, 2, 'BI-FAST', 'Layanan BI-FAST real-time payment', 0, 'Network', 3, 1),

-- PT. Lintasarta Services (Cloud)
(8, 3, 'Cloud Server - Surrounding', 'Cloud server untuk aplikasi surrounding (8 servers)', 39650000, 'Infrastructure', 1, 1),
(9, 3, 'Cloud Server - DEKA DBAAS', 'Database as a Service', 9900000, 'Infrastructure', 1, 1),
(10, 3, 'Cloud Server - DEKA BOX', 'Storage service', 4000000, 'Infrastructure', 1, 1),
(11, 3, 'Cloud Server - SKAI', 'Server untuk aplikasi SKAI', 5855856, 'Infrastructure', 1, 1),
(12, 3, 'Cloud Server - HCMS', 'Server untuk HCMS', 5405405, 'Infrastructure', 1, 1),
(13, 3, 'Cloud Server - Umum', 'Server untuk aplikasi umum (6 servers)', 28000000, 'Infrastructure', 1, 1),
(14, 3, 'Cloud Server - Pelaporan Regulasi', 'Server untuk pelaporan OJK', 9000000, 'Infrastructure', 1, 1),
(15, 3, 'Cloud Server - ELOS', 'Server aplikasi ELOS (5 servers)', 32000000, 'Infrastructure', 1, 1),
(16, 3, 'Cloud Server - ELOS Dev', 'Server development ELOS', 15000000, 'Infrastructure', 1, 1),
(17, 3, 'Cloud Server - Testing', 'Server untuk testing', 7850000, 'Infrastructure', 1, 1),

-- PT. Lintasarta Services (Datacom)
(18, 3, 'IPVPN DC Sentul', 'Koneksi IPVPN ke DC Sentul (Backhaul, BI, MPN, Artajasa, Alto, DJP)', 30400000, 'Network', 2, 1),
(19, 3, 'Dedicated Internet DC Sentul', 'Internet untuk DC Sentul', 10000000, 'Network', 2, 1),
(20, 3, 'IPVPN DRC Serpong', 'Koneksi IPVPN ke DRC Serpong (Backhaul, Artajasa, Alto, Finnet, MPN, DJP)', 24200000, 'Network', 2, 1),
(21, 3, 'Dedicated Internet DRC Serpong', 'Internet untuk DRC Serpong', 4590909, 'Network', 2, 1),
(22, 3, 'IPVPN DC Tekno', 'Koneksi IPVPN ke DC Tekno', 16300000, 'Network', 2, 1),
(23, 3, 'Colocation DC Tekno & Jatiluhur', 'Colocation di 2 lokasi', 24000000, 'Infrastructure', 1, 1),
(24, 3, 'Metro Ethernet DC-DRC', 'Koneksi Metro Ethernet antar DC', 6500000, 'Network', 2, 1),

-- PT. Lintasarta Services (Security)
(25, 3, 'Managed SOC 200 MPS', 'Security Operation Center dengan LogRhythm', 42000000, 'Security', 1, 1),
(26, 3, 'Managed WAF on Cloud', 'Web Application Firewall untuk multiple apps', 5000000, 'Security', 1, 1),

-- PT. Metalogix Services
(27, 4, 'Switching XLINK', 'Layanan switching XLINK', 811446000, 'Software', 1, 1),

-- PT. eMobile Services
(28, 5, 'SMS/USSD Gateway', 'Layanan SMS dan USSD Gateway untuk mobile banking', 18750000, 'Network', 1, 1),

-- PT. Metrocom Services
(29, 6, 'FDS (Fraud Detection System)', 'Sistem deteksi fraud', 0, 'Software', 1, 1),

-- PT. SPS Services
(30, 7, 'Cloud Server E-Learning', 'Server untuk e-learning', 41325300, 'Infrastructure', 1, 1),
(31, 7, 'Annual Maintenance E-Learning', 'Maintenance aplikasi e-learning', 80000000, 'Software', 1, 1),

-- PT. Tangara Services
(32, 8, 'Data Comm Tangara', 'Layanan komunikasi data Tangara', 0, 'Network', 2, 1),

-- PT. Telkomsat Services
(33, 9, 'Data Comm Telkomsat', 'Layanan komunikasi data via satelit', 0, 'Network', 2, 1);

-- ============================================================================
-- 4. BUDGETS (ANGGARAN) - 2025
-- ============================================================================
INSERT INTO budgets (id, year, vendor_id, budget_amount, description) VALUES
(1, 2025, 1, 15000000000, 'Anggaran PT. Collega Inti Pratama 2025'),
(2, 2025, 2, 2000000000, 'Anggaran PT. Artajasa 2025'),
(3, 2025, 3, 6000000000, 'Anggaran PT. Lintasarta 2025'),
(4, 2025, 4, 2000000000, 'Anggaran PT. Metalogix 2025'),
(5, 2025, 5, 300000000, 'Anggaran PT. eMobile 2025'),
(6, 2025, 6, 2000000000, 'Anggaran PT. Metrocom 2025'),
(7, 2025, 7, 200000000, 'Anggaran PT. SPS 2025');

-- ============================================================================
-- 5. TRANSACTIONS (TAGIHAN/INVOICE) - 2025
-- ============================================================================

-- PT. Collega Inti Pratama - Corebanking OLIBS 2025
INSERT INTO transactions (id, vendor_id, service_id, invoice_no, period, nominal, ppn, total, status, invoice_date, due_date, received_date, memo_date, pay_date, notes) VALUES
(1, 1, 1, 'INV-CIP-CB-2025-01', '2025-01', 1024000000, 39600000, 1131645000, 'paid', '2025-01-16', '2025-02-16', '2025-02-04', '2025-02-05', '2025-02-05', 'Corebanking Januari 2025'),
(2, 1, 1, 'INV-CIP-CB-2025-02', '2025-02', 1024000000, 112145000, 1131645000, 'paid', '2025-02-17', '2025-03-17', '2025-02-26', '2025-04-08', '2025-04-08', 'Corebanking Februari 2025'),
(3, 1, 1, 'INV-CIP-CB-2025-03', '2025-03', 1024000000, 112145000, 1131645000, 'paid', '2025-03-17', '2025-04-17', '2025-03-24', '2025-04-08', '2025-04-08', 'Corebanking Maret 2025'),
(4, 1, 1, 'INV-CIP-CB-2025-04', '2025-04', 1024000000, 112145000, 1131645000, 'paid', '2025-04-16', '2025-05-16', '2025-04-30', '2025-05-02', '2025-05-02', 'Corebanking April 2025'),
(5, 1, 1, 'INV-CIP-CB-2025-05', '2025-05', 1024000000, 112145000, 1131645000, 'paid', '2025-05-16', '2025-06-16', '2025-05-22', '2025-05-27', '2025-05-27', 'Corebanking Mei 2025'),
(6, 1, 1, 'INV-CIP-CB-2025-06', '2025-06', 1024000000, 112640000, 1136640000, 'paid', '2025-06-16', '2025-07-16', '2025-06-25', '2025-06-30', '2025-06-30', 'Corebanking Juni 2025'),
(7, 1, 1, 'INV-CIP-CB-2025-07', '2025-07', 1024000000, 112640000, 1136640000, 'paid', '2025-07-16', '2025-08-16', '2025-07-22', '2025-08-01', '2025-08-01', 'Corebanking Juli 2025'),
(8, 1, 1, 'INV-CIP-CB-2025-08', '2025-08', 1024000000, 112640000, 1136640000, 'paid', '2025-08-19', '2025-09-19', '2025-08-25', '2025-09-02', '2025-09-02', 'Corebanking Agustus 2025'),
(9, 1, 1, 'INV-CIP-CB-2025-09', '2025-09', 1024000000, 112640000, 1136640000, 'paid', '2025-09-16', '2025-10-16', '2025-09-22', '2025-09-29', '2025-09-29', 'Corebanking September 2025'),
(10, 1, 1, 'INV-CIP-CB-2025-10', '2025-10', 1024000000, 112640000, 1136640000, 'paid', '2025-10-16', '2025-11-16', '2025-10-20', '2025-10-27', '2025-10-27', 'Corebanking Oktober 2025'),
(11, 1, 1, 'INV-CIP-CB-2025-11', '2025-11', 1024000000, 112640000, 1136640000, 'paid', '2025-11-17', '2025-12-17', '2025-11-21', '2025-11-27', '2025-11-27', 'Corebanking November 2025'),
(12, 1, 1, 'INV-CIP-CB-2025-12', '2025-12', 1024000000, 112640000, 1136640000, 'paid', '2025-12-16', '2026-01-16', '2025-12-24', '2025-12-24', '2025-12-24', 'Corebanking Desember 2025'),

-- PT. Artajasa - ATM Bersama 2025
(13, 2, 6, 'INV-ART-ATM-2025-01', '2025-01', 20000000, 2200000, 22200000, 'paid', '2025-01-20', '2025-02-20', NULL, '2025-03-25', '2025-03-25', 'ATM Bersama Januari 2025'),
(14, 2, 6, 'INV-ART-ATM-2025-02', '2025-02', 20000000, 2200000, 22200000, 'paid', '2025-02-20', '2025-03-20', NULL, '2025-03-25', '2025-03-25', 'ATM Bersama Februari 2025'),
(15, 2, 6, 'INV-ART-ATM-2025-03', '2025-03', 20000000, 2200000, 22200000, 'paid', '2025-03-20', '2025-04-20', NULL, '2025-04-16', '2025-04-16', 'ATM Bersama Maret 2025'),
(16, 2, 6, 'INV-ART-ATM-2025-04', '2025-04', 20000000, 2200000, 22200000, 'paid', '2025-04-21', '2025-05-21', NULL, '2025-05-14', '2025-05-14', 'ATM Bersama April 2025'),
(17, 2, 6, 'INV-ART-ATM-2025-05', '2025-05', 20000000, 2200000, 22200000, 'paid', '2025-05-20', '2025-06-20', NULL, '2025-06-13', '2025-06-13', 'ATM Bersama Mei 2025'),
(18, 2, 6, 'INV-ART-ATM-2025-06', '2025-06', 20000000, 2200000, 22200000, 'paid', '2025-06-20', '2025-07-20', NULL, '2025-07-07', '2025-07-07', 'ATM Bersama Juni 2025'),
(19, 2, 6, 'INV-ART-ATM-2025-07', '2025-07', 20000000, 2200000, 22200000, 'paid', '2025-07-20', '2025-08-20', NULL, '2025-08-19', '2025-08-19', 'ATM Bersama Juli 2025'),
(20, 2, 6, 'INV-ART-ATM-2025-08', '2025-08', 20000000, 2200000, 22200000, 'paid', '2025-08-20', '2025-09-20', NULL, '2025-09-29', '2025-09-29', 'ATM Bersama Agustus 2025'),
(21, 2, 6, 'INV-ART-ATM-2025-09', '2025-09', 20000000, 2200000, 22200000, 'paid', '2025-09-20', '2025-10-20', NULL, '2025-10-02', '2025-10-02', 'ATM Bersama September 2025'),
(22, 2, 6, 'INV-ART-ATM-2025-10', '2025-10', 20000000, 2200000, 22200000, 'paid', '2025-10-20', '2025-11-20', NULL, '2025-11-03', '2025-11-03', 'ATM Bersama Oktober 2025'),
(23, 2, 6, 'INV-ART-ATM-2025-11', '2025-11', 20000000, 2200000, 22200000, 'paid', '2025-11-20', '2025-12-20', NULL, '2025-12-16', '2025-12-16', 'ATM Bersama November 2025'),
(24, 2, 6, 'INV-ART-ATM-2025-12', '2025-12', 20000000, 2200000, 22200000, 'paid', '2025-12-20', '2026-01-20', NULL, '2025-12-24', '2025-12-24', 'ATM Bersama Desember 2025'),

-- PT. Artajasa - BI-FAST 2025 (Variable amounts based on transactions)
(25, 2, 7, 'INV-ART-BIFAST-2025-01', '2025-01', 131019600, 14412156, 145431756, 'paid', '2025-01-31', '2025-02-28', '2025-02-18', '2025-02-19', '2025-02-19', 'BI-FAST Januari 2025'),
(26, 2, 7, 'INV-ART-BIFAST-2025-02', '2025-02', 138758400, 15263424, 154021824, 'paid', '2025-02-28', '2025-03-28', '2025-03-26', '2025-04-08', '2025-04-08', 'BI-FAST Februari 2025'),
(27, 2, 7, 'INV-ART-BIFAST-2025-03', '2025-03', 158587200, 17444592, 176031792, 'paid', '2025-03-31', '2025-04-30', '2025-04-25', '2025-04-28', '2025-04-28', 'BI-FAST Maret 2025'),
(28, 2, 7, 'INV-ART-BIFAST-2025-06', '2025-06', 25864200, 2845062, 28709262, 'paid', '2025-06-30', '2025-07-30', '2025-07-22', '2025-08-01', '2025-08-01', 'BI-FAST Juni 2025'),
(29, 2, 7, 'INV-ART-BIFAST-2025-07', '2025-07', 114871200, 12635832, 127507032, 'paid', '2025-07-31', '2025-08-31', '2025-09-29', '2025-10-02', '2025-10-02', 'BI-FAST Juli 2025'),
(30, 2, 7, 'INV-ART-BIFAST-2025-08', '2025-08', 111104400, 12221484, 123325884, 'paid', '2025-08-31', '2025-09-30', '2025-09-16', '2025-09-17', '2025-09-17', 'BI-FAST Agustus 2025'),
(31, 2, 7, 'INV-ART-BIFAST-2025-09', '2025-09', 116949600, 12864456, 129814056, 'paid', '2025-09-30', '2025-10-30', '2025-10-14', '2025-10-15', '2025-10-15', 'BI-FAST September 2025'),
(32, 2, 7, 'INV-ART-BIFAST-2025-10', '2025-10', 122172600, 13438986, 135611586, 'paid', '2025-10-31', '2025-11-30', '2025-11-17', '2025-11-27', '2025-11-27', 'BI-FAST Oktober 2025'),
(33, 2, 7, 'INV-ART-BIFAST-2025-11', '2025-11', 113245800, 12457038, 125702838, 'paid', '2025-11-30', '2025-12-30', '2025-12-24', '2025-12-30', '2025-12-30', 'BI-FAST November 2025'),
(34, 2, 7, 'INV-ART-BIFAST-2025-12', '2025-12', 158433000, 17427630, 175860630, 'pending', '2025-12-31', '2026-01-30', '2026-01-14', NULL, NULL, 'BI-FAST Desember 2025 - Menunggu pembayaran'),

-- PT. eMobile - SMS/USSD Gateway 2025
(35, 5, 28, 'INV-EMB-2025-01', '2025-01', 18750000, 2062500, 20812500, 'paid', '2025-01-13', '2025-02-13', '2025-01-07', NULL, '2025-01-20', 'SMS/USSD Gateway Jan-Feb 2025'),
(36, 5, 28, 'INV-EMB-2025-02', '2025-02', 18750000, 2062500, 20812500, 'paid', '2025-02-13', '2025-03-13', '2025-02-04', NULL, '2025-02-15', 'SMS/USSD Gateway Feb-Mar 2025'),
(37, 5, 28, 'INV-EMB-2025-03', '2025-03', 18750000, 2062500, 20812500, 'paid', '2025-03-13', '2025-04-13', '2025-02-04', NULL, '2025-03-20', 'SMS/USSD Gateway Mar-Apr 2025'),
(38, 5, 28, 'INV-EMB-2025-04', '2025-04', 18750000, 2062500, 20812500, 'paid', '2025-04-13', '2025-05-13', '2025-04-10', NULL, '2025-04-25', 'SMS/USSD Gateway Apr-May 2025'),
(39, 5, 28, 'INV-EMB-2025-05', '2025-05', 18750000, 2062500, 20812500, 'paid', '2025-05-13', '2025-06-13', '2025-05-02', NULL, '2025-05-20', 'SMS/USSD Gateway May-Jun 2025'),
(40, 5, 28, 'INV-EMB-2025-06', '2025-06', 18750000, 2062500, 20812500, 'paid', '2025-06-13', '2025-07-13', '2025-06-03', NULL, '2025-06-25', 'SMS/USSD Gateway Jun-Jul 2025'),
(41, 5, 28, 'INV-EMB-2025-07', '2025-07', 18750000, 2062500, 20812500, 'paid', '2025-07-13', '2025-08-13', '2025-07-01', NULL, '2025-07-20', 'SMS/USSD Gateway Jul-Aug 2025'),
(42, 5, 28, 'INV-EMB-2025-08', '2025-08', 18750000, 2062500, 20812500, 'paid', '2025-08-13', '2025-09-13', '2025-08-04', NULL, '2025-08-25', 'SMS/USSD Gateway Aug-Sep 2025'),
(43, 5, 28, 'INV-EMB-2025-09', '2025-09', 18750000, 2062500, 20812500, 'paid', '2025-09-13', '2025-10-13', '2025-09-02', NULL, '2025-09-20', 'SMS/USSD Gateway Sep-Oct 2025'),
(44, 5, 28, 'INV-EMB-2025-10', '2025-10', 18750000, 2062500, 20812500, 'paid', '2025-10-13', '2025-11-13', '2025-10-02', NULL, '2025-10-20', 'SMS/USSD Gateway Oct-Nov 2025'),
(45, 5, 28, 'INV-EMB-2025-11', '2025-11', 18750000, 2062500, 20812500, 'paid', '2025-11-13', '2025-12-13', '2025-11-04', NULL, '2025-11-20', 'SMS/USSD Gateway Nov-Dec 2025'),
(46, 5, 28, 'INV-EMB-2025-12', '2025-12', 18750000, 2062500, 20812500, 'paid', '2025-12-13', '2026-01-13', '2025-12-01', NULL, '2025-12-20', 'SMS/USSD Gateway Dec-Jan 2025'),

-- PT. Lintasarta - Cloud Server 2025
(47, 3, 8, 'INV-LA-CLOUD-2025-01', '2025-01', 28900000, 3179000, 32079000, 'paid', '2025-01-15', '2025-02-15', NULL, NULL, '2025-02-10', 'Cloud Server Januari 2025'),
(48, 3, 8, 'INV-LA-CLOUD-2025-0102', '2025-01', 305161261, 33567739, 338728999, 'paid', '2025-01-20', '2025-02-20', NULL, NULL, '2025-02-25', 'Cloud Server Jan-Feb 2025'),
(49, 3, 8, 'INV-LA-CLOUD-2025-0203', '2025-02', 255598761, 28115864, 283714625, 'paid', '2025-02-15', '2025-03-15', NULL, NULL, '2025-03-20', 'Cloud Server Feb-Mar 2025'),
(50, 3, 8, 'INV-LA-CLOUD-2025-0304', '2025-03', 234411261, 25785239, 260196500, 'paid', '2025-03-15', '2025-04-15', NULL, NULL, '2025-04-10', 'Cloud Server Mar-Apr 2025'),
(51, 3, 8, 'INV-LA-CLOUD-2025-0405', '2025-04', 234411261, 25785239, 260196500, 'paid', '2025-04-15', '2025-05-15', NULL, NULL, '2025-05-10', 'Cloud Server Apr-May 2025'),
(52, 3, 8, 'INV-LA-CLOUD-2025-0506', '2025-05', 234411261, 25785239, 260196500, 'paid', '2025-05-15', '2025-06-15', NULL, NULL, '2025-06-10', 'Cloud Server May-Jun 2025'),
(53, 3, 8, 'INV-LA-CLOUD-2025-0607', '2025-06', 234411261, 25785239, 260196500, 'paid', '2025-06-15', '2025-07-15', NULL, NULL, '2025-07-10', 'Cloud Server Jun-Jul 2025'),
(54, 3, 8, 'INV-LA-CLOUD-2025-0708', '2025-07', 234411261, 25785239, 260196500, 'paid', '2025-07-15', '2025-08-15', NULL, NULL, '2025-08-10', 'Cloud Server Jul-Aug 2025'),
(55, 3, 8, 'INV-LA-CLOUD-2025-0809', '2025-08', 234411261, 25785239, 260196500, 'paid', '2025-08-15', '2025-09-15', NULL, NULL, '2025-09-10', 'Cloud Server Aug-Sep 2025'),
(56, 3, 8, 'INV-LA-CLOUD-2025-0910', '2025-09', 169833333, 18681667, 188515000, 'paid', '2025-09-15', '2025-10-15', NULL, NULL, '2025-10-10', 'Cloud Server Sep-Oct 2025'),
(57, 3, 8, 'INV-LA-CLOUD-2025-1011', '2025-10', 246411261, 27105239, 273516500, 'paid', '2025-10-15', '2025-11-15', NULL, NULL, '2025-11-10', 'Cloud Server Oct-Nov 2025'),
(58, 3, 8, 'INV-LA-CLOUD-2025-1112', '2025-11', 246411261, 27105239, 273516500, 'paid', '2025-11-15', '2025-12-15', NULL, NULL, '2025-12-10', 'Cloud Server Nov-Dec 2025'),

-- PT. Metalogix - Switching XLINK 2025
(59, 4, 27, 'INV-MLX-XLINK-2025-H1', '2025-01', 811446000, 89259060, 900705060, 'pending', '2025-01-15', '2025-02-15', NULL, NULL, NULL, 'Switching XLINK Tahun Ketiga - Semester I'),
(60, 4, 27, 'INV-MLX-XLINK-2025-H2', '2025-07', 811446000, 89259060, 900705060, 'pending', '2025-07-15', '2025-08-15', NULL, NULL, NULL, 'Switching XLINK Tahun Ketiga - Semester II'),

-- PT. Metrocom - FDS 2025 (Project-based)
(61, 6, 29, 'INV-MTC-FDS-2025-T1', '2025-06', 895000000, 0, 895000000, 'paid', '2025-05-15', '2025-06-15', NULL, NULL, '2025-06-12', 'FDS Termin I 50%'),
(62, 6, 29, 'INV-MTC-FDS-2025-T2', '2025-09', 895000000, 0, 895000000, 'paid', '2025-08-15', '2025-09-15', NULL, NULL, '2025-09-04', 'FDS Termin II 50%'),
(63, 6, 29, 'INV-MTC-FDS-2025-API', '2025-09', 36630000, 0, 36630000, 'paid', '2025-09-15', '2025-10-15', NULL, NULL, '2025-09-29', 'Biaya Jasa Implementasi FDS API');

-- ============================================================================
-- 6. SETTINGS (PENGATURAN APLIKASI)
-- ============================================================================
INSERT INTO settings (key, value, description) VALUES
('company_name', 'Bank SulutGo', 'Nama perusahaan'),
('division_name', 'Divisi Teknologi Informasi', 'Nama divisi'),
('ppn_rate', '0.11', 'Tarif PPN (11%)'),
('ppn_rate_2025', '0.12', 'Tarif PPN mulai 2025 (12%)'),
('reminder_days_before', '7', 'Hari sebelum jatuh tempo untuk reminder'),
('currency', 'IDR', 'Mata uang'),
('fiscal_year_start', '01-01', 'Awal tahun fiskal');

-- ============================================================================
-- 7. NETWORK ASSETS
-- ============================================================================
INSERT INTO network_assets (id, vendor_id, location, service_type, product_name, site_name, bandwidth, mrc, contract_no, sia_no) VALUES
(1, 3, 'DC Sentul', 'IPVPN', 'IPVPN Backhaul', 'DC SENTUL BACKHAUL', '5120 Kbps', 11000000, 'LA/CORP/2015', '2015004308'),
(2, 3, 'DC Sentul', 'Internet', 'Dedicated Internet', 'DC SENTUL INTERNET', '10240 Kbps', 5000000, 'LA/CORP/2017', '2017008018'),
(3, 3, 'DC Sentul', 'IPVPN', 'IPVPN Extranet BI', 'DC SENTUL EXTRANET BI BACKUP', '512 Kbps', 4500000, 'LA/CORP/2018', '2018007518'),
(4, 3, 'DC Sentul', 'IPVPN', 'IPVPN MPN-G2', 'DC SENTUL MPN-G2', '128 Kbps', 3100000, 'LA/CORP/2014', '2014003338'),
(5, 3, 'DC Sentul', 'IPVPN', 'IPVPN Artajasa', 'DC SENTUL ARTAJASA', '2048 Kbps', 4600000, 'LA/CORP/2015', '2015005264'),
(6, 3, 'DC Sentul', 'IPVPN', 'IPVPN ALTO', 'DC SENTUL ALTO', '128 Kbps', 3100000, 'LA/CORP/2018', '2018003444'),
(7, 3, 'DRC Serpong', 'IPVPN', 'IPVPN Backhaul', 'DRC SERPONG BACKHAUL', '10240 Kbps', 8000000, 'LA/CORP/2021', '2021287806'),
(8, 3, 'DRC Serpong', 'Internet', 'Dedicated Internet', 'DRC SERPONG INTERNET', '3000 Kbps', 3000000, 'LA/CORP/2021', '2021287807'),
(9, 3, 'DRC Serpong', 'IPVPN', 'IPVPN Artajasa', 'DRC SERPONG ARTAJASA', '128 Kbps', 2600000, 'LA/CORP/2021', '2021287808'),
(10, 3, 'DC Tekno BSD', 'Colocation', 'RackBasedArrear', 'DC TEKNO COLLOCATION', NULL, 12000000, 'SC100017493/LA/CORP/2023', '2022339827'),
(11, 3, 'DC Jatiluhur', 'Colocation', 'RackBasedArrear', 'JATILUHUR COLLOCATION', NULL, 12000000, 'SC100017493/LA/CORP/2023', '2023369058');

-- ============================================================================
-- 8. CLOUD SERVERS
-- ============================================================================
INSERT INTO cloud_servers (id, vendor_id, project_name, server_name, vcpu, ram_gb, storage_gb, os, firewall, price, mrc, contract_no, sia_no) VALUES
(1, 3, 'Bank Sulutgo-Surrounding', 'Surrouding-1', 8, 32, 200, 'Ubuntu 22.04', 'Elite/L3', 4500000, 39650000, '0055 LA CORP 2022', '2022329062'),
(2, 3, 'Bank Sulutgo-Surrounding', 'Surrouding-2', 8, 32, 200, 'Ubuntu 22.04', 'Elite/L3', 4500000, NULL, '0055 LA CORP 2022', '2022329062'),
(3, 3, 'Bank Sulutgo-Surrounding', 'Surrouding-3', 8, 32, 200, 'Ubuntu 22.04', 'Elite/L3', 4500000, NULL, '0055 LA CORP 2022', '2022329062'),
(4, 3, 'Bank Sulutgo-Surrounding', 'Surrouding-4', 8, 32, 200, 'Ubuntu 22.04', 'Elite/L3', 4500000, NULL, '0055 LA CORP 2022', '2022329062'),
(5, 3, 'Bank Sulutgo-Surrounding', 'Surrounding-5-Win', 8, 32, 1000, 'Windows 2019', 'Elite/L3', 8150000, NULL, '0055 LA CORP 2022', '2022329062'),
(6, 3, 'Bank Sulutgo-Surrounding', 'Surrouding-6-New', 8, 32, 200, 'Ubuntu 22.04', 'Elite/L3', 4500000, NULL, '0055 LA CORP 2022', '2022329062'),
(7, 3, 'Bank Sulutgo-Surrounding', 'Surrounding-7-New', 8, 32, 200, 'Ubuntu 22.04', 'Elite/L3', 4500000, NULL, '0055 LA CORP 2022', '2022329062'),
(8, 3, 'Bank Sulutgo-Surrounding', 'Surrounding-8-New', 8, 32, 200, 'Ubuntu 22.04', 'Elite/L3', 4500000, NULL, '0055 LA CORP 2022', '2022329062'),
(9, 3, 'Bank Sulutgo-SKAI', 'SKAI_3', 4, 16, 1000, 'Ubuntu 22.04', 'Elite/L3', 5855856, 5855856, '0055 LA CORP 2022', '2022330793'),
(10, 3, 'Bank Sulutgo-HCMS', 'SERVER-HCMS-NEW', 4, 16, 512, 'Ubuntu 22.04', 'Elite/L3', 5405405, 5405405, '0055 LA CORP 2022', '2022336660'),
(11, 3, 'Bank Sulutgo-Umum', 'PROD-FRONTEND-Server1-Ubuntu', 16, 32, 50, 'Ubuntu 22.04', 'Elite/L3', 2500000, 28000000, '0055 LA CORP 2022', '2022329888'),
(12, 3, 'Bank Sulutgo-Umum', 'PROD-FRONTEND-Server2-Ubuntu', 16, 32, 50, 'Ubuntu 22.04', 'Elite/L3', 2500000, NULL, '0055 LA CORP 2022', '2022329888'),
(13, 3, 'Bank Sulutgo-Umum', 'Prod-Backend-Winser2016', 16, 32, 50, 'Windows 2016', 'Elite/L3', 2500000, NULL, '0055 LA CORP 2022', '2022329888'),
(14, 3, 'Bank Sulutgo-App-ELOS', 'Agent-2', 8, 16, 100, 'Windows Server', 'Elite/L3', 8000000, 32000000, '0055 LA CORP 2022', '2022340001'),
(15, 3, 'Bank Sulutgo-App-ELOS', 'Agent-1', 8, 16, 100, 'Windows Server', 'Elite/L3', 8000000, NULL, '0055 LA CORP 2022', '2022340001'),
(16, 3, 'Bank Sulutgo-App-ELOS', 'Server-DB-Winser', 8, 16, 100, 'Windows Server', 'Elite/L3', 8000000, NULL, '0055 LA CORP 2022', '2022340001'),
(17, 3, 'Bank Sulutgo-App-ELOS', 'Server-API-Winser', 8, 16, 100, 'Windows Server', 'Elite/L3', 8000000, NULL, '0055 LA CORP 2022', '2022340001');
