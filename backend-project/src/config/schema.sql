CREATE TABLE users (

    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 -- 1. Parking Slots Table
CREATE TABLE parking_slots (
    slot_number INT PRIMARY KEY,
    status ENUM('available', 'occupied') DEFAULT 'available'
);

-- 2. Cars Table
CREATE TABLE cars (
    plate_number VARCHAR(20) PRIMARY KEY,
    driver_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL
);

-- 3. Parking Records Table (Handles Entry and Exit)
CREATE TABLE parking_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(20),
    slot_number INT,
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP NULL DEFAULT NULL,
    duration_hours INT DEFAULT NULL,
    status ENUM('active', 'completed') DEFAULT 'active',
    FOREIGN KEY (plate_number) REFERENCES cars(plate_number),
    FOREIGN KEY (slot_number) REFERENCES parking_slots(slot_number)
);

-- 4. Payments Table (Generates Bill & Tracks User)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT, -- Tracks the manager who generated the bill
    FOREIGN KEY (record_id) REFERENCES parking_records(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
