-- ============================================
-- EMR SYSTEM - PostgreSQL Database Schema
-- Production-Ready Schema with Proper Constraints
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS FOR TYPE SAFETY
-- ============================================

CREATE TYPE user_role AS ENUM (
    'Admin',
    'Doctor',
    'Nurse',
    'FrontDesk',
    'LabTechnician',
    'Pharmacist'
);

CREATE TYPE appointment_status AS ENUM (
    'Scheduled',
    'CheckedIn',
    'InProgress',
    'Completed',
    'Cancelled',
    'NoShow'
);

CREATE TYPE encounter_type AS ENUM (
    'OPD',
    'IPD',
    'Emergency',
    'FollowUp'
);

CREATE TYPE lab_test_status AS ENUM (
    'Ordered',
    'SampleCollected',
    'Processing',
    'Completed',
    'Approved',
    'Cancelled'
);

CREATE TYPE bed_status AS ENUM (
    'Available',
    'Occupied',
    'Maintenance',
    'Cleaning'
);

CREATE TYPE ipd_admission_status AS ENUM (
    'Admitted',
    'Discharged',
    'Transferred',
    'Deceased',
    'AMA' -- Against Medical Advice
);

CREATE TYPE payment_status AS ENUM (
    'Pending',
    'Partial',
    'Paid',
    'Refunded'
);

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    specialization VARCHAR(100), -- For doctors
    license_number VARCHAR(50), -- For doctors
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Index for login performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================
-- PATIENTS TABLE
-- ============================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uhid VARCHAR(20) UNIQUE NOT NULL, -- Unique Health ID
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    blood_group VARCHAR(5),
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    occupation VARCHAR(100),
    marital_status VARCHAR(50),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(50),
    allergies TEXT, -- JSON array of allergies
    chronic_conditions TEXT, -- JSON array of conditions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Index for patient search
CREATE INDEX idx_patients_uhid ON patients(uhid);
CREATE INDEX idx_patients_name ON patients(first_name, last_name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_dob ON patients(dob);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    token_number INTEGER NOT NULL,
    status appointment_status DEFAULT 'Scheduled',
    appointment_type VARCHAR(50) DEFAULT 'General',
    reason_for_visit TEXT,
    notes TEXT,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    consultation_started_at TIMESTAMP WITH TIME ZONE,
    consultation_ended_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    UNIQUE(appointment_date, token_number)
);

-- Index for appointment queries
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);

-- ============================================
-- ENCOUNTERS TABLE (Clinical Visits)
-- ============================================

CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    encounter_type encounter_type DEFAULT 'OPD',
    encounter_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    chief_complaints TEXT NOT NULL, -- JSON array
    history_of_present_illness TEXT,
    past_medical_history TEXT, -- JSON array
    past_surgical_history TEXT, -- JSON array
    family_history TEXT, -- JSON array
    social_history TEXT,
    medications_current TEXT, -- JSON array
    allergies_at_encounter TEXT, -- JSON array
    vital_signs JSONB, -- {bp_sysolic, bp_diastolic, pulse, temp, spo2, weight, height, bmi}
    general_examination TEXT,
    systemic_examination TEXT,
    provisional_diagnosis TEXT, -- JSON array with ICD codes
    final_diagnosis TEXT, -- JSON array with ICD codes
    clinical_notes TEXT,
    advice TEXT,
    follow_up_date DATE,
    follow_up_notes TEXT,
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for encounter queries
CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_doctor ON encounters(doctor_id);
CREATE INDEX idx_encounters_date ON encounters(encounter_date);
CREATE INDEX idx_encounters_appointment ON encounters(appointment_id);

-- ============================================
-- PRESCRIPTIONS TABLE
-- ============================================

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    brand_name VARCHAR(255),
    dosage VARCHAR(100) NOT NULL, -- e.g., "500mg"
    frequency VARCHAR(100) NOT NULL, -- e.g., "1-0-1" or "Twice daily"
    duration_days INTEGER,
    duration_unit VARCHAR(20) DEFAULT 'days', -- days, weeks, months
    route_of_administration VARCHAR(50) DEFAULT 'Oral', -- Oral, IV, IM, etc.
    instructions TEXT, -- e.g., "After food", "Empty stomach"
    quantity_prescribed INTEGER,
    is_favorite BOOLEAN DEFAULT false,
    template_name VARCHAR(100), -- If saved as template
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Index for prescription queries
CREATE INDEX idx_prescriptions_encounter ON prescriptions(encounter_id);
CREATE INDEX idx_prescriptions_medicine ON prescriptions(medicine_name);

-- ============================================
-- LAB TESTS TABLE
-- ============================================

CREATE TABLE lab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    test_name VARCHAR(255) NOT NULL,
    test_code VARCHAR(50),
    category VARCHAR(100), -- Pathology, Radiology, Microbiology, etc.
    sample_type VARCHAR(50), -- Blood, Urine, Stool, etc.
    priority VARCHAR(20) DEFAULT 'Routine', -- Routine, Urgent, STAT
    status lab_test_status DEFAULT 'Ordered',
    collection_instructions TEXT,
    result_data JSONB, -- {test_parameter: {value, unit, ref_range_min, ref_range_max}}
    result_entered_by UUID REFERENCES users(id),
    result_entered_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for lab test queries
CREATE INDEX idx_lab_tests_patient ON lab_tests(patient_id);
CREATE INDEX idx_lab_tests_doctor ON lab_tests(doctor_id);
CREATE INDEX idx_lab_tests_status ON lab_tests(status);
CREATE INDEX idx_lab_tests_encounter ON lab_tests(encounter_id);

-- ============================================
-- WARDS TABLE
-- ============================================

CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward_name VARCHAR(100) NOT NULL,
    ward_type VARCHAR(50) NOT NULL, -- General, ICU, Private, SemiPrivate, etc.
    floor_number INTEGER,
    total_beds INTEGER NOT NULL,
    available_beds INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BEDS TABLE
-- ============================================

CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    bed_number VARCHAR(20) NOT NULL,
    bed_type VARCHAR(50) NOT NULL, -- Standard, Deluxe, ICU, etc.
    status bed_status DEFAULT 'Available',
    current_patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    last_cleaned_at TIMESTAMP WITH TIME ZONE,
    cleaned_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ward_id, bed_number)
);

-- Index for bed queries
CREATE INDEX idx_beds_ward ON beds(ward_id);
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_beds_patient ON beds(current_patient_id);

-- ============================================
-- IPD ADMISSIONS TABLE
-- ============================================

CREATE TABLE ipd_admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE RESTRICT,
    admitting_doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    admission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_discharge_date DATE,
    actual_discharge_date TIMESTAMP WITH TIME ZONE,
    discharge_summary TEXT,
    discharge_condition VARCHAR(100), -- Stable, Improved, Critical, etc.
    follow_up_instructions TEXT,
    medications_at_discharge TEXT, -- JSON array
    status ipd_admission_status DEFAULT 'Admitted',
    admission_diagnosis TEXT, -- JSON array
    procedures_done TEXT, -- JSON array
    complications TEXT, -- JSON array
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for IPD queries
CREATE INDEX idx_ipd_admissions_patient ON ipd_admissions(patient_id);
CREATE INDEX idx_ipd_admissions_bed ON ipd_admissions(bed_id);
CREATE INDEX idx_ipd_admissions_doctor ON ipd_admissions(admitting_doctor_id);
CREATE INDEX idx_ipd_admissions_status ON ipd_admissions(status);
CREATE INDEX idx_ipd_admissions_dates ON ipd_admissions(admission_date, actual_discharge_date);

-- ============================================
-- VITAL SIGNS HISTORY TABLE (For IPD monitoring)
-- ============================================

CREATE TABLE vitals_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    admission_id UUID REFERENCES ipd_admissions(id) ON DELETE CASCADE,
    recorded_by UUID NOT NULL REFERENCES users(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    bp_systolic INTEGER, -- mmHg
    bp_diastolic INTEGER, -- mmHg
    pulse INTEGER, -- bpm
    temperature DECIMAL(4,1), -- Celsius
    spo2 INTEGER, -- Percentage
    respiratory_rate INTEGER, -- breaths/min
    weight DECIMAL(5,2), -- kg
    height DECIMAL(5,2), -- cm
    pain_score INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
    glasgow_coma_scale INTEGER,
    intake_ml INTEGER,
    output_ml INTEGER,
    notes TEXT
);

-- Index for vitals queries
CREATE INDEX idx_vitals_patient ON vitals_history(patient_id);
CREATE INDEX idx_vitals_admission ON vitals_history(admission_id);
CREATE INDEX idx_vitals_recorded_at ON vitals_history(recorded_at);

-- ============================================
-- INVENTORY TABLE (Medicines & Supplies)
-- ============================================

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    gst_number VARCHAR(20),
    drug_license_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    brand_name VARCHAR(255),
    batch_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'Tablet', -- Tablet, Capsule, Syrup, Injection, etc.
    purchase_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    mrp DECIMAL(10,2),
    reorder_level INTEGER DEFAULT 10,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    category VARCHAR(100), -- Antibiotic, Analgesic, Antipyretic, etc.
    storage_instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Index for inventory queries
CREATE INDEX idx_inventory_medicine ON inventory(medicine_name);
CREATE INDEX idx_inventory_batch ON inventory(batch_number);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);
CREATE INDEX idx_inventory_supplier ON inventory(supplier_id);

-- ============================================
-- PURCHASE ORDERS TABLE
-- ============================================

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date DATE,
    received_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Received, Cancelled
    total_amount DECIMAL(12,2),
    items JSONB NOT NULL, -- Array of {medicine_name, quantity, price}
    notes TEXT,
    created_by UUID REFERENCES users(id),
    received_by UUID REFERENCES users(id)
);

-- ============================================
-- DISPENSING TABLE (Pharmacy)
-- ============================================

CREATE TABLE dispensing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
    admission_id UUID REFERENCES ipd_admissions(id) ON DELETE SET NULL,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    medicine_name VARCHAR(255) NOT NULL,
    quantity_dispensed INTEGER NOT NULL,
    batch_number VARCHAR(50),
    dispensed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dispensed_by UUID REFERENCES users(id),
    total_amount DECIMAL(10,2),
    payment_status payment_status DEFAULT 'Pending',
    notes TEXT
);

-- Index for dispensing queries
CREATE INDEX idx_dispensing_patient ON dispensing(patient_id);
CREATE INDEX idx_dispensing_encounter ON dispensing(encounter_id);
CREATE INDEX idx_dispensing_medicine ON dispensing(medicine_name);

-- ============================================
-- BILLING TABLE
-- ============================================

CREATE TABLE billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
    admission_id UUID REFERENCES ipd_admissions(id) ON DELETE SET NULL,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    bill_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    bill_type VARCHAR(50) NOT NULL, -- Registration, Consultation, Lab, Pharmacy, IPD, etc.
    items JSONB NOT NULL, -- Array of {description, quantity, rate, amount}
    subtotal DECIMAL(12,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2),
    payment_status payment_status DEFAULT 'Pending',
    payment_method VARCHAR(50), -- Cash, Card, UPI, Insurance, etc.
    insurance_claim_amount DECIMAL(12,2),
    remarks TEXT,
    created_by UUID REFERENCES users(id),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for billing queries
CREATE INDEX idx_billing_patient ON billing(patient_id);
CREATE INDEX idx_billing_bill_number ON billing(bill_number);
CREATE INDEX idx_billing_date ON billing(bill_date);
CREATE INDEX idx_billing_status ON billing(payment_status);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- LOGIN, CREATE, UPDATE, DELETE, VIEW, EXPORT, etc.
    entity_type VARCHAR(50), -- Patient, User, Appointment, etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for audit log queries
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ============================================
-- HOSPITAL SETTINGS TABLE
-- ============================================

CREATE TABLE hospital_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO hospital_settings (setting_key, setting_value, setting_type, description) VALUES
('hospital_name', 'HealthCare Hospital', 'string', 'Official hospital name'),
('hospital_address', '123 Medical Street, Healthcare City', 'string', 'Hospital address'),
('hospital_phone', '+91-1234567890', 'string', 'Hospital contact number'),
('hospital_email', 'info@healthcarehospital.com', 'string', 'Hospital email'),
('hospital_logo_url', '/assets/logo.png', 'string', 'Hospital logo path'),
('consultation_fee_default', '500', 'number', 'Default consultation fee'),
('registration_fee_default', '100', 'number', 'Default registration fee'),
('tax_percentage', '0', 'number', 'Tax percentage for billing'),
('currency_symbol', '₹', 'string', 'Currency symbol'),
('timezone', 'Asia/Kolkata', 'string', 'Hospital timezone');

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_encounters_updated_at BEFORE UPDATE ON encounters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON beds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ipd_admissions_updated_at BEFORE UPDATE ON ipd_admissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospital_settings_updated_at BEFORE UPDATE ON hospital_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR UHID GENERATION
-- ============================================

CREATE OR REPLACE FUNCTION generate_uhid()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    seq_num INTEGER;
    new_uhid TEXT;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(uhid FROM 7) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM patients
    WHERE uhid LIKE 'UHID%' || year_part || '%';
    
    new_uhid := 'UHID' || year_part || LPAD(seq_num::TEXT, 6, '0');
    NEW.uhid := new_uhid;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_patient_uhid 
BEFORE INSERT ON patients 
FOR EACH ROW 
WHEN (NEW.uhid IS NULL)
EXECUTE FUNCTION generate_uhid();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for today's appointments
CREATE VIEW v_todays_appointments AS
SELECT 
    a.id,
    a.token_number,
    a.appointment_time,
    a.status,
    p.uhid,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.age,
    p.gender,
    p.phone,
    u.name AS doctor_name,
    u.specialization
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN users u ON a.doctor_id = u.id
WHERE a.appointment_date = CURRENT_DATE
ORDER BY a.token_number;

-- View for bed occupancy
CREATE VIEW v_bed_occupancy AS
SELECT 
    w.ward_name,
    w.ward_type,
    COUNT(b.id) AS total_beds,
    COUNT(CASE WHEN b.status = 'Occupied' THEN 1 END) AS occupied_beds,
    COUNT(CASE WHEN b.status = 'Available' THEN 1 END) AS available_beds,
    ROUND(COUNT(CASE WHEN b.status = 'Occupied' THEN 1 END)::NUMERIC / COUNT(b.id)::NUMERIC * 100, 2) AS occupancy_percentage
FROM wards w
LEFT JOIN beds b ON w.id = b.ward_id
WHERE w.is_active = true
GROUP BY w.id, w.ward_name, w.ward_type;

-- View for low stock inventory
CREATE VIEW v_low_stock_inventory AS
SELECT 
    i.id,
    i.medicine_name,
    i.generic_name,
    i.batch_number,
    i.quantity,
    i.reorder_level,
    i.expiry_date,
    s.supplier_name,
    CASE 
        WHEN i.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
        WHEN i.quantity <= i.reorder_level THEN 'Low Stock'
        ELSE 'OK'
    END AS alert_type
FROM inventory i
LEFT JOIN suppliers s ON i.supplier_id = s.id
WHERE i.quantity <= i.reorder_level 
   OR i.expiry_date < CURRENT_DATE + INTERVAL '30 days'
ORDER BY 
    CASE WHEN i.expiry_date < CURRENT_DATE THEN 1 ELSE 0 END DESC,
    i.expiry_date ASC,
    i.quantity ASC;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'Stores all system users with role-based access control';
COMMENT ON TABLE patients IS 'Master patient registry with demographic and insurance information';
COMMENT ON TABLE appointments IS 'OPD appointment scheduling with token management';
COMMENT ON TABLE encounters IS 'Clinical encounter records for each patient visit';
COMMENT ON TABLE prescriptions IS 'Medication prescriptions linked to encounters';
COMMENT ON TABLE lab_tests IS 'Laboratory test orders and results';
COMMENT ON TABLE ipd_admissions IS 'Inpatient admission records with bed assignments';
COMMENT ON TABLE vitals_history IS 'Time-series vital signs for IPD monitoring';
COMMENT ON TABLE inventory IS 'Medicine and medical supplies inventory with batch tracking';
COMMENT ON TABLE billing IS 'Financial transactions and invoicing';
COMMENT ON TABLE audit_logs IS 'System audit trail for compliance and security';

-- ============================================
-- END OF SCHEMA
-- ============================================
