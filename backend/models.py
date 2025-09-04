import sqlite3
from werkzeug.security import generate_password_hash
from datetime import datetime

class Database:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.init_db()
        return cls._instance
    
    def init_db(self):
        self.conn = sqlite3.connect('inventory.db', check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.create_tables()
        self.insert_sample_data()
    
    def create_tables(self):
        tables = [
            '''CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )''',
            '''CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )''',
            '''CREATE TABLE IF NOT EXISTS suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                contact_info TEXT,
                address TEXT,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )''',
            '''CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                category_id INTEGER,
                supplier_id INTEGER,
                price REAL NOT NULL,
                cost_price REAL,
                quantity INTEGER NOT NULL DEFAULT 0,
                min_stock INTEGER NOT NULL DEFAULT 5,
                sku TEXT UNIQUE,
                barcode TEXT,
                image_url TEXT,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories (id),
                FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
                FOREIGN KEY (created_by) REFERENCES users (id)
            )''',
            '''CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('IN', 'OUT', 'ADJUST')),
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                total_value REAL GENERATED ALWAYS AS (quantity * price) STORED,
                notes TEXT,
                reference TEXT,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products (id),
                FOREIGN KEY (created_by) REFERENCES users (id)
            )''',
            '''CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action TEXT NOT NULL,
                table_name TEXT,
                record_id INTEGER,
                old_values TEXT,
                new_values TEXT,
                ip_address TEXT,
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )'''
        ]
        
        for table in tables:
            self.conn.execute(table)
        self.conn.commit()
    
    def insert_sample_data(self):
        # Insert default admin user
        try:
            self.conn.execute(
                "INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                ("admin", generate_password_hash("admin123"), "admin")
            )
            
            # Insert sample categories
            sample_categories = [
                ('Electronics', 'Electronic devices and components'),
                ('Clothing', 'Apparel and clothing items'),
                ('Food', 'Food and beverage products'),
                ('Books', 'Books and publications'),
                ('Office Supplies', 'Office stationery and supplies')
            ]
            
            for category in sample_categories:
                self.conn.execute(
                    "INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)",
                    category
                )
            
            # Insert sample suppliers
            sample_suppliers = [
                ('Supplier A', 'contact@suppliera.com', '123 Main St, City'),
                ('Supplier B', 'contact@supplierb.com', '456 Oak St, Town'),
                ('Supplier C', 'contact@supplierc.com', '789 Pine St, Village')
            ]
            
            for supplier in sample_suppliers:
                self.conn.execute(
                    "INSERT OR IGNORE INTO suppliers (name, contact_info, address) VALUES (?, ?, ?)",
                    supplier
                )
            
            # Insert sample products
            sample_products = [
                ('Laptop', 'High-performance laptop', 1, 1, 999.99, 750.00, 10, 2, 'LT-001'),
                ('Smartphone', 'Latest smartphone model', 1, 1, 499.99, 350.00, 15, 5, 'SP-001'),
                ('Tablet', 'Portable tablet device', 1, 2, 299.99, 200.00, 8, 3, 'TB-001'),
                ('T-Shirt', 'Cotton t-shirt', 2, 3, 19.99, 10.00, 50, 10, 'TS-001'),
                ('Coffee', 'Premium coffee beans', 3, 2, 12.99, 8.00, 30, 5, 'CF-001')
            ]
            
            for product in sample_products:
                self.conn.execute(
                    """INSERT OR IGNORE INTO products 
                    (name, description, category_id, supplier_id, price, cost_price, quantity, min_stock, sku) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    product
                )
            
            self.conn.commit()
        except Exception as e:
            print(f"Error inserting sample data: {e}")
    
    def close(self):
        if self.conn:
            self.conn.close()