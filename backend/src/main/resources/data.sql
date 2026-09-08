-- ====================================================================
-- TRIP PILOT ZERO-SETUP DATABASE INITIAL SEEDING SCRIPT (5 CITIES)
-- Supported Cities: Visakhapatnam, Hyderabad, Bengaluru, Delhi, Mumbai
-- ====================================================================

-- 1. Tariff Rules (Statutory RTO / Municipal Regulated Tariffs)
MERGE INTO tariff_rules KEY(id) VALUES (1, 'Visakhapatnam', 'AUTO', 20.0, 1.5, 12.0, 50.0, 23, 5, 1.0, 0.0, 'AP RTO Gazette No. 42');
MERGE INTO tariff_rules KEY(id) VALUES (2, 'Visakhapatnam', 'CAB', 60.0, 2.0, 16.0, 25.0, 23, 5, 2.0, 0.0, 'AP Transport Dept 2024');
MERGE INTO tariff_rules KEY(id) VALUES (3, 'Hyderabad', 'AUTO', 30.0, 1.6, 15.0, 50.0, 23, 5, 1.2, 0.0, 'TS RTO Notification 2023');
MERGE INTO tariff_rules KEY(id) VALUES (4, 'Hyderabad', 'CAB', 80.0, 2.0, 18.0, 25.0, 23, 5, 2.5, 0.0, 'TS Transport Dept 2024');
MERGE INTO tariff_rules KEY(id) VALUES (5, 'Bengaluru', 'AUTO', 30.0, 2.0, 15.0, 50.0, 23, 5, 1.0, 0.0, 'KA Transport Gaz. 109');
MERGE INTO tariff_rules KEY(id) VALUES (6, 'Bengaluru', 'CAB', 100.0, 4.0, 18.0, 20.0, 23, 5, 2.0, 0.0, 'KA City Taxi Rules 2024');
MERGE INTO tariff_rules KEY(id) VALUES (7, 'Delhi', 'AUTO', 30.0, 1.5, 11.0, 25.0, 23, 5, 1.0, 0.0, 'Delhi Transport Dept 2023');
MERGE INTO tariff_rules KEY(id) VALUES (8, 'Delhi', 'CAB', 50.0, 1.0, 14.0, 25.0, 23, 5, 1.5, 0.0, 'Delhi Taxi Scheme 2024');
MERGE INTO tariff_rules KEY(id) VALUES (9, 'Mumbai', 'AUTO', 23.0, 1.5, 15.33, 25.0, 23, 5, 1.2, 0.0, 'MMRTA Order Oct 2022');
MERGE INTO tariff_rules KEY(id) VALUES (10, 'Mumbai', 'CAB', 28.0, 1.5, 18.66, 25.0, 23, 5, 1.5, 0.0, 'MMRTA Order Oct 2022');
