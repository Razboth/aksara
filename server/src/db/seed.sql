-- ============================================================================
-- AKSARA - Seed Data from Rekap Pembayaran Tagihan 2025.xls
-- Bank SulutGo - Divisi Teknologi Informasi
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
-- 1. GL ACCOUNTS
-- ============================================================================
INSERT INTO gl_accounts (id, code, name, category) VALUES
(1, '5400102', 'Biaya Sewa IT', 'Operating Expense'),
(2, '5400101', 'Jaringan Komunikasi Online', 'Operating Expense'),
(3, '5480104', 'Beban Transaksi E-Channel', 'Operating Expense');

-- ============================================================================
-- 2. VENDORS
-- ============================================================================
INSERT INTO vendors (id, name, short_name, color, contact_person, email, phone, address, npwp) VALUES
(1, 'PT. Collega Inti Pratama', 'CIP', '#B6244F', 'Admin CIP', 'admin@collega.co.id', '021-12345678', 'Jakarta', '01.234.567.8-012.000'),
(2, 'PT. Artajasa Pembayaran Elektronis', 'Artajasa', '#504746', 'Shirke W.', 'admin@artajasa.co.id', '021-87654321', 'Jakarta', '02.345.678.9-012.000'),
(3, 'PT. Aplikanusa Lintasarta', 'Lintasarta', '#B89685', 'Admin Lintasarta', 'admin@lintasarta.co.id', '021-11223344', 'Jakarta', '03.456.789.0-012.000'),
(4, 'PT. eMobile Indonesia', 'eMobile', '#FBB7C0', 'Admin eMobile', 'admin@emobile.co.id', '021-33445566', 'Jakarta', '04.567.890.1-012.000'),
(5, 'PT. Strategic Partner Solution', 'SPS', '#BFADA3', 'Admin SPS', 'admin@sps.co.id', '021-55667788', 'Jakarta', '05.678.901.2-012.000'),
(6, 'PT. Metrocom Global Solusi', 'Metrocom', '#14B8A6', 'Admin Metrocom', 'admin@metrocom.co.id', '021-44556677', 'Jakarta', '06.789.012.3-012.000');

-- ============================================================================
-- 3. SERVICES
-- ============================================================================
INSERT INTO services (id, vendor_id, name, description, monthly_fee, type, gl_account_id, is_active) VALUES
-- CIP Services
(1, 1, 'Core Banking System OLIBS 724', 'Jasa Outsourcing Corebanking System + DC/DRC', 1019500000, 'Software', 1, 1),
(2, 1, 'MIS/Data Warehouse', 'Jasa Outsourcing Hardware dan Software Data Warehouse + Sewa Aplikasi MIS', 117000000, 'Software', 1, 1),
(3, 1, 'PSAK 71', 'Biaya Outsourcing DC/DRC aplikasi PSAK 71', 67000000, 'Software', 1, 1),
(4, 1, 'APU PPT', 'Biaya Sewa Aplikasi APU PPT', 20000000, 'Software', 1, 1),
(5, 1, 'Mobile Banking BSGtouch', 'Biaya Outsourcing DC/DRC aplikasi Mobile Banking', 95000000, 'Software', 1, 1),

-- Artajasa Services
(6, 2, 'ATM Bersama', 'Layanan ATM Bersama bulanan', 20000000, 'Network', 1, 1),
(7, 2, 'BI FAST', 'Layanan BI FAST transaksi bulanan', 130000000, 'Network', 3, 1),

-- Lintasarta Services
(8, 3, 'Cloud Switching', 'Cloud Switching Server + Collocation', 158333333, 'Infrastructure', 1, 1),
(9, 3, 'Cloud eLos', 'Cloud eLos Dev, Deka Box, DBaaS, Harbor, Service Portal', 234411261, 'Infrastructure', 1, 1),
(10, 3, 'Managed HSM', 'Managed Device HSM', 54833333, 'Security', 1, 1),

-- eMobile Services
(11, 4, 'SMS/USSD Gateway', 'Layanan SMS/USSD Gateway, SMS Push dan USSD Mobile Banking', 18750000, 'Network', 1, 1),

-- SPS Services
(12, 5, 'E-Learning', 'Cloud Server dan Annual Maintenance E-Learning', 0, 'Software', 1, 1),

-- Metrocom Services
(13, 6, 'FDS', 'Fraud Detection System Implementation', 0, 'Security', 1, 1);

-- ============================================================================
-- 4. BUDGETS 2025
-- ============================================================================
INSERT INTO budgets (id, year, vendor_id, budget_amount, description) VALUES
(1, 2025, 1, 17622810000, 'CIP - CBS, DC-DRC, MIS, PSAK71, APU-PPT, Mobile Banking'),
(2, 2025, 2, 1750000000, 'Artajasa - ATM Bersama + BI FAST'),
(3, 2025, 3, 6000000000, 'Lintasarta - Cloud Server'),
(4, 2025, 4, 250000000, 'eMobile - SMS/USSD Gateway'),
(5, 2025, 5, 125000000, 'SPS - E-Learning'),
(6, 2025, 6, 1900000000, 'Metrocom - FDS');

-- ============================================================================
-- 5. TRANSACTIONS - CIP (PT. Collega Inti Pratama) 2025
-- ============================================================================
INSERT INTO transactions (vendor_id, service_id, invoice_no, period, nominal, ppn, total, status, invoice_date, due_date, memo_date, pay_date, notes) VALUES
-- Januari (CBS, MIS, PSAK71, Mobile Banking)
(1, 1, 'CIP/2025/01', '2025-01', 1218500000, 134035000, 1352535000, 'paid', '2025-01-13', '2025-02-12', '2025-02-05', '2025-02-07', 'CBS, MIS, PSAK71, Mobile Banking - Januari'),
-- Februari (+APU PPT)
(1, 1, 'CIP/2025/02', '2025-02', 1238500000, 136235000, 1374735000, 'paid', '2025-02-14', '2025-03-16', '2025-04-08', '2025-04-11', 'CBS, MIS, PSAK71, APU-PPT, Mobile Banking - Februari'),
-- Maret
(1, 1, 'CIP/2025/03', '2025-03', 1238500000, 136235000, 1374735000, 'paid', '2025-03-13', '2025-04-12', '2025-04-08', '2025-04-15', 'CBS, MIS, PSAK71, APU-PPT, Mobile Banking - Maret'),
-- April
(1, 1, 'CIP/2025/04', '2025-04', 1238500000, 136235000, 1374735000, 'paid', '2025-04-13', '2025-05-13', '2025-05-02', '2025-05-09', 'CBS, MIS, PSAK71, APU-PPT, Mobile Banking - April'),
-- Mei
(1, 1, 'CIP/2025/05', '2025-05', 1238500000, 136235000, 1374735000, 'paid', '2025-05-13', '2025-06-12', '2025-05-27', '2025-06-04', 'CBS, MIS, PSAK71, APU-PPT, Mobile Banking - Mei'),
-- Juni (new rate)
(1, 1, 'CIP/2025/06', '2025-06', 1243000000, 136730000, 1379730000, 'paid', '2025-06-13', '2025-07-13', '2025-06-30', '2025-07-09', 'CBS, MIS, PSAK71, APU-PPT, Mobile Banking - Juni'),
-- Juli
(1, 1, 'CIP/2025/07', '2025-07', 1243000000, 136730000, 1379730000, 'paid', '2025-07-13', '2025-08-12', '2025-08-01', '2025-08-08', 'CBS, MIS, PSAK71, APU-PPT, Mobile Banking - Juli'),
-- Agustus (Mobile Banking increase to 95M)
(1, 1, 'CIP/2025/08', '2025-08', 1323000000, 145530000, 1468530000, 'paid', '2025-08-18', '2025-09-17', '2025-09-02', '2025-09-21', 'CBS, MIS, PSAK71, APU-PPT, Mobile Banking - Agustus'),
-- September
(1, 1, 'CIP/2025/09', '2025-09', 1323000000, 145530000, 1468530000, 'paid', '2025-09-16', '2025-10-16', '2025-09-29', '2025-09-30', 'CBS, MIS, PSAK71, APU-PPT, Mobile Banking - September'),
-- Oktober
(1, 1, 'CIP/2025/10', '2025-10', 1323000000, 145530000, 1468530000, 'paid', '2025-10-16', '2025-11-15', '2025-10-27', '2025-11-11', 'CBS, MIS, PSAK71, APU-PPT, Mobile Banking - Oktober'),
-- November (pending)
(1, 1, 'CIP/2025/11', '2025-11', 1323000000, 145530000, 1468530000, 'pending', '2025-11-15', '2025-12-15', NULL, NULL, 'CBS, MIS, PSAK71, APU-PPT, Mobile Banking - November'),
-- Desember (pending)
(1, 1, 'CIP/2025/12', '2025-12', 1323000000, 145530000, 1468530000, 'pending', '2025-12-15', '2026-01-14', NULL, NULL, 'CBS, MIS, PSAK71, APU-PPT, Mobile Banking - Desember');

-- ============================================================================
-- 6. TRANSACTIONS - Artajasa ATM Bersama 2025
-- ============================================================================
INSERT INTO transactions (vendor_id, service_id, invoice_no, period, nominal, ppn, total, status, invoice_date, due_date, memo_date, pay_date, notes) VALUES
(2, 6, 'AJ/ATM/2025/01', '2025-01', 20000000, 2200000, 22200000, 'paid', '2025-01-17', '2025-02-16', '2025-03-25', '2025-03-27', 'ATM Bersama - Januari'),
(2, 6, 'AJ/ATM/2025/02', '2025-02', 20000000, 2200000, 22200000, 'paid', '2025-02-17', '2025-03-19', '2025-03-25', '2025-03-27', 'ATM Bersama - Februari'),
(2, 6, 'AJ/ATM/2025/03', '2025-03', 20000000, 2200000, 22200000, 'paid', '2025-03-16', '2025-04-15', '2025-04-16', '2025-04-21', 'ATM Bersama - Maret'),
(2, 6, 'AJ/ATM/2025/04', '2025-04', 20000000, 2200000, 22200000, 'paid', '2025-04-18', '2025-05-18', '2025-05-14', '2025-05-19', 'ATM Bersama - April'),
(2, 6, 'AJ/ATM/2025/05', '2025-05', 20000000, 2200000, 22200000, 'paid', '2025-05-27', '2025-06-26', '2025-06-13', '2025-06-13', 'ATM Bersama - Mei'),
(2, 6, 'AJ/ATM/2025/06', '2025-06', 20000000, 2200000, 22200000, 'paid', '2025-06-07', '2025-07-07', '2025-07-07', '2025-07-09', 'ATM Bersama - Juni'),
(2, 6, 'AJ/ATM/2025/07', '2025-07', 20000000, 2200000, 22200000, 'paid', '2025-07-17', '2025-08-16', '2025-08-18', '2025-08-20', 'ATM Bersama - Juli'),
(2, 6, 'AJ/ATM/2025/08', '2025-08', 20000000, 2200000, 22200000, 'paid', '2025-08-19', '2025-09-18', '2025-09-29', '2025-09-30', 'ATM Bersama - Agustus'),
(2, 6, 'AJ/ATM/2025/09', '2025-09', 20000000, 2200000, 22200000, 'paid', '2025-09-20', '2025-10-20', '2025-10-02', '2025-10-03', 'ATM Bersama - September'),
(2, 6, 'AJ/ATM/2025/10', '2025-10', 20000000, 2200000, 22200000, 'paid', '2025-10-20', '2025-11-19', '2025-11-03', '2025-11-17', 'ATM Bersama - Oktober'),
(2, 6, 'AJ/ATM/2025/11', '2025-11', 20000000, 2200000, 22200000, 'paid', '2025-11-21', '2025-12-21', '2025-12-16', '2025-12-20', 'ATM Bersama - November'),
(2, 6, 'AJ/ATM/2025/12', '2025-12', 20000000, 2200000, 22200000, 'paid', '2025-12-21', '2026-01-20', '2025-12-24', '2026-01-11', 'ATM Bersama - Desember');

-- ============================================================================
-- 7. TRANSACTIONS - Artajasa BI FAST 2025
-- ============================================================================
INSERT INTO transactions (vendor_id, service_id, invoice_no, period, nominal, ppn, total, status, invoice_date, due_date, memo_date, pay_date, notes) VALUES
(2, 7, 'AJ/BIFAST/2025/01', '2025-01', 131019600, 14412156, 145431756, 'paid', '2025-02-08', '2025-03-10', '2025-02-19', '2025-02-22', 'BI FAST - Januari'),
(2, 7, 'AJ/BIFAST/2025/02', '2025-02', 138758400, 15263424, 154021824, 'paid', '2025-02-26', '2025-03-28', '2025-04-08', '2025-04-09', 'BI FAST - Februari'),
(2, 7, 'AJ/BIFAST/2025/03', '2025-03', 158587200, 17444592, 176031792, 'paid', '2025-03-27', '2025-04-26', '2025-04-28', '2025-04-29', 'BI FAST - Maret'),
-- April & Mei: Tidak ada transaksi (BI FAST close)
(2, 7, 'AJ/BIFAST/2025/06', '2025-06', 25864200, 2845062, 28709262, 'paid', '2025-07-07', '2025-08-06', '2025-08-01', '2025-08-08', 'BI FAST - Juni'),
(2, 7, 'AJ/BIFAST/2025/07', '2025-07', 114871200, 12635832, 127507032, 'paid', '2025-07-28', '2025-08-27', '2025-10-02', '2025-10-03', 'BI FAST - Juli'),
(2, 7, 'AJ/BIFAST/2025/08', '2025-08', 111104400, 12221484, 123325884, 'paid', '2025-08-30', '2025-09-29', '2025-09-17', '2025-09-18', 'BI FAST - Agustus'),
(2, 7, 'AJ/BIFAST/2025/09', '2025-09', 116949600, 12864456, 129814056, 'paid', '2025-09-30', '2025-10-30', '2025-10-15', '2025-10-17', 'BI FAST - September'),
(2, 7, 'AJ/BIFAST/2025/10', '2025-10', 122172600, 13438986, 135611586, 'paid', '2025-10-31', '2025-11-30', '2025-11-27', '2025-12-09', 'BI FAST - Oktober'),
(2, 7, 'AJ/BIFAST/2025/11', '2025-11', 113245800, 12457038, 125702838, 'paid', '2025-11-30', '2025-12-30', '2025-12-30', '2026-01-11', 'BI FAST - November'),
(2, 7, 'AJ/BIFAST/2025/12', '2025-12', 158433000, 17427630, 175860630, 'pending', '2025-12-31', '2026-01-30', NULL, NULL, 'BI FAST - Desember - Menunggu pembayaran');

-- ============================================================================
-- 8. TRANSACTIONS - Lintasarta Cloud 2025
-- ============================================================================
INSERT INTO transactions (vendor_id, service_id, invoice_no, period, nominal, ppn, total, status, invoice_date, due_date, memo_date, pay_date, notes) VALUES
-- 2025 Cloud Transactions
(3, 9, '25/0005749', '2025-01', 28900000, 3179000, 32089000, 'paid', '2025-01-09', '2025-02-08', '2025-04-08', '2025-05-29', 'Cloud eLos Dev - Januari'),
(3, 10, '25/0005777', '2025-01', 54833333, 6031667, 60875000, 'paid', '2025-01-09', '2025-02-08', '2025-04-08', '2025-05-29', 'Managed HSM - Januari'),
(3, 9, '25/0010721', '2025-02', 305161261, 33567739, 338739000, 'paid', '2025-02-01', '2025-03-03', '2025-04-08', '2025-04-21', 'Cloud eLos Dev - Jan-Feb'),
(3, 8, '25/0010563', '2025-02', 158333333, 17416667, 175760000, 'paid', '2025-02-01', '2025-03-03', '2025-04-08', '2025-04-21', 'Cloud Switching - Jan-Feb'),
(3, 9, '25/0026184', '2025-03', 255598761, 28115864, 283724625, 'paid', '2025-03-15', '2025-04-14', '2025-04-08', '2025-04-21', 'Cloud eLos Dev - Feb-Mar'),
(3, 8, '25/0018510', '2025-03', 158333333, 17416667, 175760000, 'paid', '2025-03-15', '2025-04-14', '2025-04-08', '2025-04-21', 'Cloud Switching - Feb-Mar'),
(3, 8, '25/0023930', '2025-04', 158333333, 17416667, 175760000, 'paid', '2025-03-28', '2025-04-27', '2025-05-08', '2025-05-16', 'Cloud Switching - Mar-Apr'),
(3, 9, '25/0027317', '2025-04', 234411261, 25785239, 260206500, 'paid', '2025-04-20', '2025-05-20', '2025-07-07', '2025-07-14', 'Cloud eLos Dev - Mar-Apr'),
(3, 9, '25/0030342', '2025-05', 234411261, 25785239, 260206500, 'paid', '2025-04-18', '2025-05-18', '2025-06-05', '2025-06-12', 'Cloud eLos Dev - Apr-May'),
(3, 9, '25/0036955', '2025-06', 234411261, 25785239, 260206500, 'paid', '2025-05-19', '2025-06-18', '2025-07-07', '2025-07-14', 'Cloud eLos Dev - May-Jun'),
(3, 8, '25/0041628', '2025-06', 223994623, 24639409, 248644032, 'paid', '2025-06-13', '2025-07-13', '2025-08-08', '2025-08-18', 'Cloud Switching + HSM - May-Jun'),
(3, 9, '25/0044330', '2025-07', 234411261, 25785239, 260206500, 'paid', '2025-06-18', '2025-07-18', '2025-08-08', '2025-08-18', 'Cloud eLos Dev - Jun-Jul'),
(3, 8, '25/043788', '2025-07', 169833333, 18681667, 188525000, 'paid', '2025-06-18', '2025-07-18', '2025-08-08', '2025-08-18', 'Cloud Switching - Jun-Jul'),
(3, 9, '25/0054942', '2025-08', 234411261, 25785239, 260206500, 'paid', '2025-07-29', '2025-08-28', '2025-09-03', '2025-09-30', 'Cloud eLos Dev - Jul-Aug'),
(3, 8, '25/0053392', '2025-08', 169833333, 18681667, 188525000, 'paid', '2025-07-29', '2025-08-28', '2025-09-03', '2025-09-30', 'Cloud Switching - Jul-Aug'),
(3, 8, '25/0041629', '2025-05', 158333333, 17416667, 175760000, 'paid', '2025-06-13', '2025-07-13', '2025-09-08', '2025-09-30', 'Cloud Switching - Apr-May'),
(3, 9, '25/0061246', '2025-09', 234411261, 25785239, 260206500, 'paid', '2025-08-31', '2025-09-30', '2025-10-07', '2025-10-14', 'Cloud eLos Dev - Aug-Sep'),
(3, 8, '25/0061825', '2025-09', 169833333, 18681667, 188525000, 'paid', '2025-08-31', '2025-09-30', '2025-10-07', '2025-10-14', 'Cloud Switching - Aug-Sep'),
(3, 8, '25/0068203', '2025-10', 169833333, 18681667, 188525000, 'paid', '2025-09-30', '2025-10-30', '2025-10-27', '2025-11-16', 'Cloud Switching - Sep-Oct'),
(3, 9, '25/0067715', '2025-10', 313211262, 34453239, 347674501, 'paid', '2025-09-30', '2025-10-30', '2025-11-27', '2025-12-04', 'Cloud eLos Dev - Apr-Oct'),
(3, 8, '25/0079917', '2025-11', 169833333, 18681667, 188525000, 'paid', '2025-10-31', '2025-11-30', '2025-11-27', '2025-12-04', 'Cloud Switching - Oct-Nov'),
(3, 9, '25/0067715B', '2025-11', 246411261, 27105239, 273526500, 'paid', '2025-10-31', '2025-11-30', '2025-11-27', '2025-12-04', 'Cloud eLos Dev - Oct-Nov'),
(3, 8, '25/0087378', '2025-12', 169833333, 18681667, 188525000, 'paid', '2025-11-30', '2025-12-30', '2025-12-23', '2026-01-11', 'Cloud Switching - Nov-Dec'),
(3, 9, '25/0083293', '2025-12', 246411261, 27105239, 273526500, 'paid', '2025-11-30', '2025-12-30', '2025-12-23', '2026-01-11', 'Cloud eLos Dev - Nov-Dec');

-- ============================================================================
-- 9. TRANSACTIONS - eMobile 2025
-- ============================================================================
INSERT INTO transactions (vendor_id, service_id, invoice_no, period, nominal, ppn, total, status, invoice_date, due_date, memo_date, pay_date, notes) VALUES
(4, 11, '25010014', '2025-01', 18750000, 2062500, 20812500, 'paid', '2025-01-14', '2025-02-13', '2025-02-05', '2025-02-07', 'SMS/USSD Gateway - 13 Jan - 12 Feb'),
(4, 11, '25020017', '2025-02', 18750000, 2062500, 20812500, 'paid', '2025-02-12', '2025-03-14', '2025-02-19', '2025-03-10', 'SMS/USSD Gateway - 13 Feb - 12 Mar'),
(4, 11, '25030054', '2025-03', 18750000, 2062500, 20812500, 'paid', '2025-02-12', '2025-03-14', '2025-03-15', '2025-03-10', 'SMS/USSD Gateway - 13 Mar - 12 Apr'),
(4, 11, '25040010', '2025-04', 18750000, 2062500, 20812500, 'paid', '2025-04-07', '2025-05-07', '2025-04-28', '2025-04-30', 'SMS/USSD Gateway - 13 Apr - 12 May'),
(4, 11, '25050001', '2025-05', 18750000, 2062500, 20812500, 'paid', '2025-04-29', '2025-05-29', '2025-05-13', '2025-05-17', 'SMS/USSD Gateway - 13 May - 12 Jun'),
(4, 11, '25060013', '2025-06', 18750000, 2062500, 20812500, 'paid', '2025-05-21', '2025-06-20', '2025-06-07', '2025-06-13', 'SMS/USSD Gateway - 13 Jun - 12 Jul'),
(4, 11, '25070010', '2025-07', 18750000, 2062500, 20812500, 'paid', '2025-06-18', '2025-07-18', '2025-07-09', '2025-07-20', 'SMS/USSD Gateway - 13 Jul - 12 Aug'),
(4, 11, '25080012', '2025-08', 18750000, 2062500, 20812500, 'paid', '2025-08-02', '2025-09-01', '2025-08-18', '2025-08-25', 'SMS/USSD Gateway - 13 Aug - 12 Sep'),
(4, 11, '25090007', '2025-09', 18750000, 2062500, 20812500, 'paid', '2025-09-02', '2025-10-02', '2025-09-17', '2025-09-18', 'SMS/USSD Gateway - 13 Sep - 12 Oct'),
(4, 11, '25100011', '2025-10', 18750000, 2062500, 20812500, 'paid', '2025-10-02', '2025-11-01', '2025-10-17', '2025-11-07', 'SMS/USSD Gateway - 13 Oct - 12 Nov'),
(4, 11, '25110005', '2025-11', 18750000, 2062500, 20812500, 'paid', '2025-11-04', '2025-12-04', '2025-11-27', '2025-12-09', 'SMS/USSD Gateway - 13 Nov - 12 Dec'),
(4, 11, '25120001', '2025-12', 18750000, 2062500, 20812500, 'paid', '2025-11-30', '2025-12-30', '2025-12-16', '2025-12-19', 'SMS/USSD Gateway - 13 Dec - 12 Jan');

-- ============================================================================
-- 10. TRANSACTIONS - SPS E-Learning 2025
-- ============================================================================
INSERT INTO transactions (vendor_id, service_id, invoice_no, period, nominal, ppn, total, status, invoice_date, due_date, memo_date, pay_date, notes) VALUES
(5, 12, 'SPS/2025/01', '2025-03', 37568455, 3756845, 41325300, 'paid', '2025-03-01', '2025-03-31', NULL, '2025-03-26', 'Cloud Server E-Learning'),
(5, 12, 'SPS/2025/02', '2025-10', 72727273, 7272727, 80000000, 'paid', '2025-10-01', '2025-10-31', NULL, '2025-10-10', 'Annual Maintenance E-Learning');

-- ============================================================================
-- 11. TRANSACTIONS - Metrocom FDS 2025
-- ============================================================================
INSERT INTO transactions (vendor_id, service_id, invoice_no, period, nominal, ppn, total, status, invoice_date, due_date, memo_date, pay_date, notes) VALUES
(6, 13, 'FDS/2025/T1', '2025-06', 813636364, 81363636, 895000000, 'paid', '2025-05-01', '2025-05-31', NULL, '2025-05-30', 'FDS Termin I 50%'),
(6, 13, 'FDS/2025/T2', '2025-09', 813636364, 81363636, 895000000, 'paid', '2025-08-01', '2025-08-31', NULL, '2025-09-04', 'FDS Termin II 50%'),
(6, 13, 'FDS/2025/API', '2025-09', 33300000, 3330000, 36630000, 'paid', '2025-09-13', '2025-10-13', NULL, '2025-09-29', 'Biaya Jasa Implementasi FDS API');

-- ============================================================================
-- 12. SETTINGS
-- ============================================================================
INSERT INTO settings (key, value, description) VALUES
('company_name', 'Bank SulutGo', 'Nama perusahaan'),
('division_name', 'Divisi Teknologi Informasi', 'Nama divisi'),
('app_name', 'AKSARA', 'Nama aplikasi'),
('app_fullname', 'Aplikasi Kontrol & Sistem Anggaran Realisasi', 'Nama lengkap aplikasi'),
('ppn_rate', '0.11', 'Tarif PPN (11%)'),
('reminder_days_before', '7', 'Hari sebelum jatuh tempo untuk reminder'),
('currency', 'IDR', 'Mata uang'),
('fiscal_year_start', '01-01', 'Awal tahun fiskal'),
('current_fiscal_year', '2025', 'Tahun fiskal aktif');
