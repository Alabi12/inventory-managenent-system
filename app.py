# app.py
from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
import json
from datetime import datetime

app = Flask(__name__)

# Database setup
def init_db():
    conn = sqlite3.connect('inventory.db')
    c = conn.cursor()
    
    # Create tables
    c.execute('''CREATE TABLE IF NOT EXISTS categories
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS suppliers
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, contact_info TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS products
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, 
                  category_id INTEGER, supplier_id INTEGER, price REAL NOT NULL, 
                  quantity INTEGER NOT NULL, min_stock INTEGER NOT NULL,
                  FOREIGN KEY (category_id) REFERENCES categories (id),
                  FOREIGN KEY (supplier_id) REFERENCES suppliers (id))''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS transactions
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL,
                  type TEXT NOT NULL CHECK(type IN ('IN', 'OUT')), quantity INTEGER NOT NULL,
                  price REAL NOT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                  notes TEXT, FOREIGN KEY (product_id) REFERENCES products (id))''')
    
    # Insert sample data if tables are empty
    if not c.execute("SELECT COUNT(*) FROM categories").fetchone()[0]:
        sample_categories = ['Electronics', 'Clothing', 'Food', 'Books']
        for category in sample_categories:
            c.execute("INSERT INTO categories (name) VALUES (?)", (category,))
    
    if not c.execute("SELECT COUNT(*) FROM suppliers").fetchone()[0]:
        sample_suppliers = [
            ('Supplier A', 'contact@suppliera.com'),
            ('Supplier B', 'contact@supplierb.com'),
            ('Supplier C', 'contact@supplierc.com')
        ]
        for supplier in sample_suppliers:
            c.execute("INSERT INTO suppliers (name, contact_info) VALUES (?, ?)", supplier)
    
    if not c.execute("SELECT COUNT(*) FROM products").fetchone()[0]:
        # Get category and supplier IDs
        electronics_id = c.execute("SELECT id FROM categories WHERE name = 'Electronics'").fetchone()[0]
        supplier_a_id = c.execute("SELECT id FROM suppliers WHERE name = 'Supplier A'").fetchone()[0]
        
        sample_products = [
            ('Laptop', electronics_id, supplier_a_id, 999.99, 10, 2),
            ('Smartphone', electronics_id, supplier_a_id, 499.99, 15, 5),
            ('Tablet', electronics_id, supplier_a_id, 299.99, 8, 3)
        ]
        for product in sample_products:
            c.execute("INSERT INTO products (name, category_id, supplier_id, price, quantity, min_stock) VALUES (?, ?, ?, ?, ?, ?)", product)
    
    conn.commit()
    conn.close()

init_db()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

# API Routes
@app.route('/api/products')
def get_products():
    conn = sqlite3.connect('inventory.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('''SELECT p.*, c.name as category_name, s.name as supplier_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 LEFT JOIN suppliers s ON p.supplier_id = s.id 
                 ORDER BY p.name''')
    products = [dict(row) for row in c.fetchall()]
    
    conn.close()
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    conn = sqlite3.connect('inventory.db')
    c = conn.cursor()
    
    # Get or create category
    c.execute("SELECT id FROM categories WHERE name = ?", (data['category'],))
    category = c.fetchone()
    if category:
        category_id = category[0]
    else:
        c.execute("INSERT INTO categories (name) VALUES (?)", (data['category'],))
        category_id = c.lastrowid
    
    # Get or create supplier
    c.execute("SELECT id FROM suppliers WHERE name = ?", (data['supplier'],))
    supplier = c.fetchone()
    if supplier:
        supplier_id = supplier[0]
    else:
        c.execute("INSERT INTO suppliers (name, contact_info) VALUES (?, ?)", 
                 (data['supplier'], ''))
        supplier_id = c.lastrowid
    
    # Insert product
    c.execute('''INSERT INTO products (name, category_id, supplier_id, price, quantity, min_stock)
                 VALUES (?, ?, ?, ?, ?, ?)''',
             (data['name'], category_id, supplier_id, data['price'], data['quantity'], data['min_stock']))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/transactions')
def get_transactions():
    conn = sqlite3.connect('inventory.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('''SELECT t.*, p.name as product_name 
                 FROM transactions t 
                 JOIN products p ON t.product_id = p.id 
                 ORDER BY t.timestamp DESC''')
    transactions = [dict(row) for row in c.fetchall()]
    
    conn.close()
    return jsonify(transactions)

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.json
    conn = sqlite3.connect('inventory.db')
    c = conn.cursor()
    
    # Insert transaction
    c.execute('''INSERT INTO transactions (product_id, type, quantity, price, notes)
                 VALUES (?, ?, ?, ?, ?)''',
             (data['product_id'], data['type'], data['quantity'], data['price'], data.get('notes', '')))
    
    # Update product quantity
    if data['type'] == 'IN':
        c.execute("UPDATE products SET quantity = quantity + ? WHERE id = ?", 
                 (data['quantity'], data['product_id']))
    else:
        c.execute("UPDATE products SET quantity = quantity - ? WHERE id = ?", 
                 (data['quantity'], data['product_id']))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/categories')
def get_categories():
    conn = sqlite3.connect('inventory.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("SELECT * FROM categories ORDER BY name")
    categories = [dict(row) for row in c.fetchall()]
    
    conn.close()
    return jsonify(categories)

@app.route('/api/suppliers')
def get_suppliers():
    conn = sqlite3.connect('inventory.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("SELECT * FROM suppliers ORDER BY name")
    suppliers = [dict(row) for row in c.fetchall()]
    
    conn.close()
    return jsonify(suppliers)

if __name__ == '__main__':
    app.run(debug=True)