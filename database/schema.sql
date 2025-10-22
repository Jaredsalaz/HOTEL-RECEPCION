-- ================================================
-- Hotel Reception System - PostgreSQL Database Schema
-- ================================================

-- Create database
-- Run this in pgAdmin or psql as superuser
-- CREATE DATABASE hotel_db;

-- Connect to the database
-- \c hotel_db;

-- ================================================
-- ENUMS (using CHECK constraints in PostgreSQL)
-- ================================================

-- Create extension for UUID if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLES
-- ================================================

-- Administrators Table
CREATE TABLE IF NOT EXISTS administrators (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guests Table
CREATE TABLE IF NOT EXISTS guests (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    id_document VARCHAR(50) UNIQUE NOT NULL,
    nationality VARCHAR(100),
    date_of_birth TIMESTAMP,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Single', 'Double', 'Suite', 'Deluxe')),
    price_per_night DECIMAL(10, 2) NOT NULL CHECK (price_per_night > 0),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    description TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Maintenance')),
    floor INTEGER,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Room Images Table
CREATE TABLE IF NOT EXISTS room_images (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    guest_id INTEGER NOT NULL REFERENCES guests(id),
    check_in_date TIMESTAMP NOT NULL,
    check_out_date TIMESTAMP NOT NULL,
    actual_check_in TIMESTAMP,
    actual_check_out TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Active', 'Completed', 'Cancelled')),
    total_price DECIMAL(10, 2) NOT NULL,
    guests_count INTEGER DEFAULT 1 CHECK (guests_count > 0),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (check_out_date > check_in_date)
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_room_number ON rooms(room_number);

CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_id_document ON guests(id_document);

CREATE INDEX idx_reservations_room_id ON reservations(room_id);
CREATE INDEX idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_check_in_date ON reservations(check_in_date);
CREATE INDEX idx_reservations_check_out_date ON reservations(check_out_date);

CREATE INDEX idx_room_images_room_id ON room_images(room_id);

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_administrators_updated_at BEFORE UPDATE ON administrators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- SEED DATA (Sample Data)
-- ================================================

-- Insert sample administrator (password: admin123)
-- Password hash generated with bcrypt
INSERT INTO administrators (username, password_hash, full_name, email, role) 
VALUES (
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eWq5P3K9w1Wm',
    'Administrator',
    'admin@hotel.com',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (room_number, type, price_per_night, capacity, description, amenities, status, floor, image_url) VALUES
('101', 'Single', 50.00, 1, 'Cozy single room with city view', '["WiFi", "TV", "AC", "Desk"]', 'Available', 1, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'),
('102', 'Single', 50.00, 1, 'Comfortable single room', '["WiFi", "TV", "AC"]', 'Available', 1, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'),
('201', 'Double', 80.00, 2, 'Spacious double room with king bed', '["WiFi", "TV", "AC", "Minibar", "Safe"]', 'Available', 2, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'),
('202', 'Double', 80.00, 2, 'Modern double room with balcony', '["WiFi", "TV", "AC", "Minibar", "Balcony"]', 'Available', 2, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'),
('301', 'Suite', 150.00, 4, 'Luxury suite with separate living area', '["WiFi", "TV", "AC", "Minibar", "Safe", "Kitchen", "Balcony"]', 'Available', 3, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'),
('302', 'Suite', 150.00, 4, 'Executive suite with ocean view', '["WiFi", "TV", "AC", "Minibar", "Safe", "Jacuzzi", "Balcony"]', 'Available', 3, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'),
('401', 'Deluxe', 200.00, 4, 'Premium deluxe room with panoramic view', '["WiFi", "TV", "AC", "Minibar", "Safe", "Kitchen", "Jacuzzi", "Balcony", "Smart Home"]', 'Available', 4, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'),
('402', 'Deluxe', 200.00, 4, 'Presidential suite with luxury amenities', '["WiFi", "TV", "AC", "Minibar", "Safe", "Kitchen", "Jacuzzi", "Balcony", "Smart Home", "Butler Service"]', 'Available', 4, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800')
ON CONFLICT (room_number) DO NOTHING;

-- Insert sample guest
INSERT INTO guests (first_name, last_name, email, phone, id_document, nationality) VALUES
('John', 'Doe', 'john.doe@email.com', '+1234567890', 'ID123456', 'USA'),
('Jane', 'Smith', 'jane.smith@email.com', '+0987654321', 'ID789012', 'UK'),
('Carlos', 'García', 'carlos.garcia@email.com', '+1122334455', 'ID345678', 'Mexico')
ON CONFLICT (email) DO NOTHING;

-- ================================================
-- VIEWS FOR REPORTING
-- ================================================

-- View: Current Room Status
CREATE OR REPLACE VIEW current_room_status AS
SELECT 
    r.id,
    r.room_number,
    r.type,
    r.status,
    r.price_per_night,
    r.capacity,
    r.floor,
    CASE 
        WHEN res.id IS NOT NULL THEN CONCAT(g.first_name, ' ', g.last_name)
        ELSE NULL
    END as current_guest,
    res.check_in_date,
    res.check_out_date
FROM rooms r
LEFT JOIN reservations res ON r.id = res.room_id AND res.status = 'Active'
LEFT JOIN guests g ON res.guest_id = g.id;

-- View: Occupancy Statistics
CREATE OR REPLACE VIEW occupancy_stats AS
SELECT 
    COUNT(*) as total_rooms,
    COUNT(CASE WHEN status = 'Occupied' THEN 1 END) as occupied_rooms,
    COUNT(CASE WHEN status = 'Available' THEN 1 END) as available_rooms,
    COUNT(CASE WHEN status = 'Maintenance' THEN 1 END) as maintenance_rooms,
    ROUND(
        (COUNT(CASE WHEN status = 'Occupied' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
        2
    ) as occupancy_rate
FROM rooms;

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to check room availability
CREATE OR REPLACE FUNCTION check_room_availability(
    p_room_id INTEGER,
    p_check_in TIMESTAMP,
    p_check_out TIMESTAMP
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM reservations
    WHERE room_id = p_room_id
        AND status IN ('Pending', 'Active')
        AND (
            (check_in_date <= p_check_in AND check_out_date > p_check_in)
            OR (check_in_date < p_check_out AND check_out_date >= p_check_out)
            OR (check_in_date >= p_check_in AND check_out_date <= p_check_out)
        );
    
    RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- GRANTS (Adjust as needed for your setup)
-- ================================================

-- Example: Grant all privileges to your application user
-- Replace 'hotel_user' with your actual database user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hotel_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hotel_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO hotel_user;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE rooms IS 'Hotel rooms inventory';
COMMENT ON TABLE guests IS 'Guest information';
COMMENT ON TABLE reservations IS 'Room reservations and bookings';
COMMENT ON TABLE administrators IS 'System administrators';
COMMENT ON TABLE room_images IS 'Room image gallery';

-- ================================================
-- COMPLETED
-- ================================================

SELECT 'Database schema created successfully!' as status;
