-- database/schema.sql

-- Create Database
CREATE DATABASE IF NOT EXISTS afaq_portfolio;
USE afaq_portfolio;

-- Table for Admin Users (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'guest') DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Projects
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) DEFAULT 'https://via.placeholder.com/600x400',
    video_url VARCHAR(255) DEFAULT NULL, -- Optional background video for project detail page
    tech_stack JSON NOT NULL, -- Stored as JSON array: ["React", "Node.js", "MySQL"]
    github_url VARCHAR(255),
    live_demo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Skills
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL, -- e.g., "Frontend", "Backend", "Databases"
    name VARCHAR(255) NOT NULL UNIQUE,
    icon_class VARCHAR(255) DEFAULT NULL, -- e.g., 'fab fa-react', or path to SVG
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Services
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_class VARCHAR(255) DEFAULT NULL, -- e.g., 'fas fa-code'
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_title VARCHAR(255), -- e.g., "CEO of Company X"
    avatar_url VARCHAR(255) DEFAULT 'https://via.placeholder.com/150',
    quote TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_projects_title ON projects(title);
CREATE INDEX idx_contact_email ON contact_messages(email);

-- Ensure JSON columns are handled correctly in your Node.js application.
-- For MySQL < 8.0, you might store JSON as TEXT and parse/stringify in your app.
-- For MySQL >= 8.0, JSON type is fully supported.