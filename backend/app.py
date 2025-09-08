from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import os
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import json
from flask import send_file
import csv
import io
import base64
import openpyxl
from io import BytesIO
import pandas as pd
import random

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['DATA_FILE'] = 'data.json'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

jwt = JWTManager(app)

# Load data from file
def load_data():
    try:
        if os.path.exists(app.config['DATA_FILE']):
            with open(app.config['DATA_FILE'], 'r') as f:
                data = json.load(f)
                # Ensure transactions array exists
                if 'transactions' not in data:
                    data['transactions'] = []
                return data
        else:
            return {
                'products': [],
                'transactions': [],  # Add transactions array
                'users': [
                    {
                        'id': 1,
                        'email': 'demo@inventory.com',
                        'password': generate_password_hash('demopassword123'),
                        'name': 'Demo User',
                        'role': 'admin'
                    }
                ]
            }
    except Exception as e:
        print(f"Error loading data: {e}")
        return {'products': [], 'transactions': [], 'users': []}

# Save data to file
def save_data(data):
    try:
        with open(app.config['DATA_FILE'], 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving data: {e}")

# Initialize data
data = load_data()
products = data.get('products', [])
transactions = data.get('transactions', [])
users = data.get('users', [])

# Make sure the save functions update the global data structure
def save_products():
    """Save products to persistent storage"""
    global data
    data['products'] = products
    save_data(data)

def save_transactions():
    """Save transactions to persistent storage"""
    global data
    data['transactions'] = transactions
    save_data(data)

# Helper functions
def find_user_by_email(email):
    return next((u for u in users if u['email'] == email), None)

def save_image(image_data, filename):
    """Save base64 image data to file"""
    try:
        # Extract the base64 data from the string
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode the base64 data
        image_bytes = base64.b64decode(image_data)
        
        # Generate a unique filename
        if not filename:
            filename = f"{uuid.uuid4().hex}.jpg"
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save the file
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
        
        return filename
    except Exception as e:
        print(f"Error saving image: {e}")
        return None

def determine_status(quantity, min_stock_level):
    """Determine product status based on quantity and min stock level"""
    if quantity == 0:
        return 'out_of_stock'
    elif quantity <= min_stock_level:
        return 'low_stock'
    else:
        return 'in_stock'

# JWT error handlers
@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        "message": "Missing authorization header",
        "error": "authorization_header_missing"
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        "message": "Invalid token",
        "error": "invalid_token"
    }), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        "message": "Token has expired",
        "error": "token_expired"
    }), 401

# Serve uploaded images
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Public routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# Auth routes
@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        user = find_user_by_email(email)
        
        if user and check_password_hash(user['password'], password):
            # Create a string identity (user ID as string)
            access_token = create_access_token(identity=str(user['id']))
            
            return jsonify({
                'token': access_token,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email'],
                    'role': user['role']
                }
            }), 200
        
        return jsonify({'message': 'Invalid credentials'}), 401
        
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

# Get all products with filtering and sorting
@app.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    try:
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get query parameters
        search = request.args.get('search', '')
        status_filter = request.args.get('status')
        category_filter = request.args.get('category')
        sort_by = request.args.get('sortBy', 'name')
        sort_order = request.args.get('sortOrder', 'asc')
        
        # Filter products
        filtered_products = products.copy()
        
        if search:
            search_lower = search.lower()
            filtered_products = [
                p for p in filtered_products 
                if (search_lower in p['name'].lower() or 
                    search_lower in p.get('sku', '').lower() or 
                    search_lower in p.get('description', '').lower())
            ]
        
        if status_filter and status_filter != 'all':
            filtered_products = [p for p in filtered_products if p['status'] == status_filter]
        
        if category_filter and category_filter != 'all':
            filtered_products = [p for p in filtered_products if p.get('category') == category_filter]
        
        # Sort products
        reverse_order = sort_order.lower() == 'desc'
        
        if sort_by in ['name', 'sku', 'category', 'status']:
            filtered_products.sort(key=lambda x: x.get(sort_by, ''), reverse=reverse_order)
        elif sort_by in ['quantity', 'min_stock_level', 'price']:
            filtered_products.sort(key=lambda x: float(x.get(sort_by, 0)), reverse=reverse_order)
        
        return jsonify(filtered_products), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch products', 'error': str(e)}), 500

# Get single product
@app.route('/products/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    try:
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        product = next((p for p in products if p['id'] == product_id), None)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        
        return jsonify(product), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch product', 'error': str(e)}), 500

# Create product
@app.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    try:
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'quantity', 'price']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        # Handle image upload
        image_filename = None
        image_data = data.get('image')
        if image_data and image_data.startswith('data:image'):
            image_filename = save_image(image_data, f"product_{data.get('sku', '')}_{uuid.uuid4().hex}.jpg")
        
        # Determine status
        quantity = int(data['quantity'])
        min_stock_level = int(data.get('min_stock_level', 0))
        status = determine_status(quantity, min_stock_level)
        
        new_product = {
            'id': max([p['id'] for p in products], default=0) + 1,
            'name': data['name'],
            'sku': data.get('sku', ''),
            'category': data.get('category', ''),
            'quantity': quantity,
            'min_stock_level': min_stock_level,
            'price': float(data['price']),
            'description': data.get('description', ''),
            'status': status,
            'last_updated': datetime.now().isoformat(),
            'image': f"/uploads/{image_filename}" if image_filename else data.get('image')
        }
        
        products.append(new_product)
        save_products()  # Save to persistent storage
        
        return jsonify(new_product), 201
    except Exception as e:
        return jsonify({'message': 'Failed to create product', 'error': str(e)}), 500

# Update product
@app.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    try:
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        product = next((p for p in products if p['id'] == product_id), None)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        
        # Handle image update
        image_data = data.get('image')
        if image_data and image_data.startswith('data:image'):
            image_filename = save_image(image_data, f"product_{data.get('sku', product.get('sku', ''))}_{uuid.uuid4().hex}.jpg")
            if image_filename:
                data['image'] = f"/uploads/{image_filename}"
        
        # Update product fields
        product['name'] = data.get('name', product['name'])
        product['sku'] = data.get('sku', product['sku'])
        product['category'] = data.get('category', product['category'])
        product['quantity'] = int(data.get('quantity', product['quantity']))
        product['min_stock_level'] = int(data.get('min_stock_level', product['min_stock_level']))
        product['price'] = float(data.get('price', product['price']))
        product['description'] = data.get('description', product['description'])
        product['last_updated'] = datetime.now().isoformat()
        product['image'] = data.get('image', product.get('image'))
        
        # Update status
        product['status'] = determine_status(product['quantity'], product['min_stock_level'])
        
        save_products()  # Save to persistent storage
        
        return jsonify(product), 200
    except Exception as e:
        return jsonify({'message': 'Failed to update product', 'error': str(e)}), 500

# Delete product
@app.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    try:
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        global products
        products = [p for p in products if p['id'] != product_id]
        save_products()  # Save to persistent storage
        
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to delete product', 'error': str(e)}), 500

# Export products
@app.route('/products/export', methods=['GET'])
@jwt_required()
def export_products():
    try:
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        format_type = request.args.get('format', 'csv')
        
        if format_type == 'csv':
            # Create CSV in memory
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow(['ID', 'Name', 'SKU', 'Category', 'Quantity', 'Min Stock Level', 'Price', 'Status', 'Description'])
            
            # Write data
            for product in products:
                writer.writerow([
                    product['id'],
                    product['name'],
                    product.get('sku', ''),
                    product.get('category', ''),
                    product['quantity'],
                    product.get('min_stock_level', 0),
                    product['price'],
                    product.get('status', ''),
                    product.get('description', '')
                ])
            
            # Prepare response
            output.seek(0)
            return send_file(
                io.BytesIO(output.getvalue().encode('utf-8')),
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'inventory_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            )
        
        elif format_type == 'excel':
            # Create Excel file in memory
            output = BytesIO()
            
            # Create DataFrame
            data_list = []
            for product in products:
                data_list.append({
                    'ID': product['id'],
                    'Name': product['name'],
                    'SKU': product.get('sku', ''),
                    'Category': product.get('category', ''),
                    'Quantity': product['quantity'],
                    'Min Stock Level': product.get('min_stock_level', 0),
                    'Price': product['price'],
                    'Status': product.get('status', ''),
                    'Description': product.get('description', ''),
                    'Last Updated': product.get('last_updated', '')
                })
            
            df = pd.DataFrame(data_list)
            
            # Write to Excel
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Inventory', index=False)
            
            output.seek(0)
            
            return send_file(
                output,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                as_attachment=True,
                download_name=f'inventory_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
            )
        
        else:
            return jsonify({'message': 'Unsupported export format'}), 400
            
    except Exception as e:
        return jsonify({'message': 'Failed to export products', 'error': str(e)}), 500

# Import products
@app.route('/products/import', methods=['POST'])
@jwt_required()
def import_products():
    try:
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        filename = file.filename.lower()
        imported_products = []
        errors = []
        
        if filename.endswith('.csv'):
            # Read CSV file
            stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
            csv_input = csv.DictReader(stream)
            
            for row_num, row in enumerate(csv_input, 2):  # Start from row 2 (header is row 1)
                try:
                    # Validate required fields
                    if not row.get('Name'):
                        errors.append(f"Row {row_num}: Missing product name")
                        continue
                    
                    # Create or update product
                    product_data = {
                        'name': row.get('Name', ''),
                        'sku': row.get('SKU', ''),
                        'category': row.get('Category', ''),
                        'quantity': int(row.get('Quantity', 0)),
                        'min_stock_level': int(row.get('Min Stock Level', 0)),
                        'price': float(row.get('Price', 0)),
                        'description': row.get('Description', '')
                    }
                    
                    # Check if product exists
                    existing_product = next((p for p in products if p.get('sku') == product_data['sku'] and product_data['sku']), None)
                    
                    if existing_product:
                        # Update existing product
                        existing_product.update(product_data)
                        existing_product['status'] = determine_status(existing_product['quantity'], existing_product['min_stock_level'])
                        existing_product['last_updated'] = datetime.now().isoformat()
                        imported_products.append(existing_product)
                    else:
                        # Create new product
                        new_product = {
                            'id': max([p['id'] for p in products], default=0) + 1,
                            **product_data,
                            'status': determine_status(product_data['quantity'], product_data['min_stock_level']),
                            'last_updated': datetime.now().isoformat(),
                            'image': None
                        }
                        products.append(new_product)
                        imported_products.append(new_product)
                        
                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")
        
        elif filename.endswith(('.xlsx', '.xls')):
            # Read Excel file
            df = pd.read_excel(file)
            
            for index, row in df.iterrows():
                try:
                    # Validate required fields
                    if pd.isna(row.get('Name')):
                        errors.append(f"Row {index + 2}: Missing product name")
                        continue
                    
                    # Create or update product
                    product_data = {
                        'name': str(row.get('Name', '')),
                        'sku': str(row.get('SKU', '')),
                        'category': str(row.get('Category', '')),
                        'quantity': int(row.get('Quantity', 0)),
                        'min_stock_level': int(row.get('Min Stock Level', 0)),
                        'price': float(row.get('Price', 0)),
                        'description': str(row.get('Description', ''))
                    }
                    
                    # Check if product exists
                    existing_product = next((p for p in products if p.get('sku') == product_data['sku'] and product_data['sku']), None)
                    
                    if existing_product:
                        # Update existing product
                        existing_product.update(product_data)
                        existing_product['status'] = determine_status(existing_product['quantity'], existing_product['min_stock_level'])
                        existing_product['last_updated'] = datetime.now().isoformat()
                        imported_products.append(existing_product)
                    else:
                        # Create new product
                        new_product = {
                            'id': max([p['id'] for p in products], default=0) + 1,
                            **product_data,
                            'status': determine_status(product_data['quantity'], product_data['min_stock_level']),
                            'last_updated': datetime.now().isoformat(),
                            'image': None
                        }
                        products.append(new_product)
                        imported_products.append(new_product)
                        
                except Exception as e:
                    errors.append(f"Row {index + 2}: {str(e)}")
        
        else:
            return jsonify({'message': 'Unsupported file format'}), 400
        
        # Save all imported products to persistent storage
        save_products()
        
        return jsonify({
            'message': f'Successfully imported {len(imported_products)} products',
            'imported_count': len(imported_products),
            'error_count': len(errors),
            'errors': errors
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to import products', 'error': str(e)}), 500

# Transaction routes
@app.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    try:
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get query parameters
        type_filter = request.args.get('type')
        status_filter = request.args.get('status')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        sort_by = request.args.get('sortBy', 'date')
        sort_order = request.args.get('sortOrder', 'desc')
        limit = int(request.args.get('limit', 0))
        
        # Filter transactions
        filtered_transactions = transactions.copy()
        
        if type_filter and type_filter != 'all':
            filtered_transactions = [t for t in filtered_transactions if t['type'] == type_filter]
        
        if status_filter and status_filter != 'all':
            filtered_transactions = [t for t in filtered_transactions if t['status'] == status_filter]
        
        if start_date:
            filtered_transactions = [t for t in filtered_transactions if t['date'] >= start_date]
        
        if end_date:
            filtered_transactions = [t for t in filtered_transactions if t['date'] <= end_date]
        
        # Sort transactions
        reverse_order = sort_order.lower() == 'desc'
        filtered_transactions.sort(key=lambda x: x.get(sort_by, ''), reverse=reverse_order)
        
        # Apply limit if specified
        if limit > 0:
            filtered_transactions = filtered_transactions[:limit]
        
        return jsonify(filtered_transactions), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch transactions', 'error': str(e)}), 500

@app.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    try:
        print("DEBUG: Received transaction creation request")
        
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        print(f"DEBUG: Request data: {data}")
        
        # Validate required fields
        required_fields = ['type', 'product_id', 'quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        # Convert product_id to integer and validate
        try:
            product_id = int(data['product_id'])
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid product ID format'}), 400
        
        # Check if products exist
        if not products:
            return jsonify({'message': 'No products available. Please create products first.'}), 400
        
        print(f"DEBUG: Looking for product ID: {product_id}")
        print(f"DEBUG: Available product IDs: {[p['id'] for p in products]}")
        
        # Find product
        product = next((p for p in products if p['id'] == product_id), None)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        
        print(f"DEBUG: Found product: {product['name']}")
        
        # Generate transaction ID
        transaction_id = f"TXN{datetime.now().strftime('%Y%m%d')}{random.randint(1000, 9999)}"
        
        # Calculate amount if not provided
        amount = data.get('amount')
        if not amount and data['type'] in ['incoming', 'outgoing']:
            amount = float(data['quantity']) * float(product['price'])
        
        # Calculate stock changes
        quantity_change = int(data['quantity'])
        previous_stock = product['quantity']
        
        if data['type'] == 'incoming':
            new_stock = previous_stock + quantity_change
        elif data['type'] == 'outgoing':
            new_stock = max(0, previous_stock - quantity_change)
        elif data['type'] == 'adjustment':
            new_stock = quantity_change
        
        new_transaction = {
            'id': transaction_id,
            'product_id': product_id,
            'product_name': product['name'],
            'product_sku': product.get('sku', ''),
            'type': data['type'],
            'quantity': quantity_change,
            'previous_stock': previous_stock,
            'new_stock': new_stock,
            'amount': float(amount) if amount else 0.0,
            'notes': data.get('notes', ''),
            'status': 'completed',
            'date': datetime.now().isoformat(),
            'created_by': user['name'],
            'reference': data.get('reference', '')
        }
        
        # Update product stock
        if data['type'] == 'incoming':
            product['quantity'] += quantity_change
        elif data['type'] == 'outgoing':
            product['quantity'] = max(0, product['quantity'] - quantity_change)
        elif data['type'] == 'adjustment':
            product['quantity'] = quantity_change
        
        # Update product status
        product['status'] = determine_status(product['quantity'], product['min_stock_level'])
        product['last_updated'] = datetime.now().isoformat()
        
        # Add transaction and save
        transactions.append(new_transaction)
        save_products()
        save_transactions()
        
        return jsonify(new_transaction), 201
        
    except Exception as e:
        print(f"ERROR in create_transaction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Failed to create transaction', 'error': str(e)}), 500
    
@app.route('/transactions/stats', methods=['GET'])
@jwt_required()
def get_transaction_stats():
    try:
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Calculate stats for last 30 days
        thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
        recent_transactions = [t for t in transactions if t['date'] >= thirty_days_ago]
        
        stats = {
            'total_transactions': len(recent_transactions),
            'total_incoming': sum(t['quantity'] for t in recent_transactions if t['type'] == 'incoming'),
            'total_outgoing': sum(t['quantity'] for t in recent_transactions if t['type'] == 'outgoing'),
            'total_revenue': sum(t['amount'] for t in recent_transactions if t['type'] == 'outgoing'),
            'total_cost': sum(t['amount'] for t in recent_transactions if t['type'] == 'incoming'),
            'profit': sum(t['amount'] for t in recent_transactions if t['type'] == 'outgoing') - 
                     sum(t['amount'] for t in recent_transactions if t['type'] == 'incoming')
        }
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch transaction stats', 'error': str(e)}), 500

# Reset database (for development only)
@app.route('/admin/reset', methods=['POST'])
def reset_database():
    try:
        global products, transactions
        products = []
        transactions = []
        save_data({'products': products, 'transactions': transactions, 'users': users})
        return jsonify({'message': 'Database reset successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to reset database', 'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    print(f"Loaded {len(products)} products from storage")
    print(f"Loaded {len(transactions)} transactions from storage")
    print("Available endpoints:")
    print("  GET  /health")
    print("  POST /auth/login")
    print("  GET  /products (requires JWT) - with filtering and sorting")
    print("  POST /products (requires JWT)")
    print("  GET  /products/<id> (requires JWT)")
    print("  PUT  /products/<id> (requires JWT)")
    print("  DELETE /products/<id> (requires JWT)")
    print("  GET  /products/export (requires JWT) - with format parameter (csv/excel)")
    print("  POST /products/import (requires JWT) - file upload")
    print("  GET  /uploads/<filename> (serves uploaded images)")
    print("  GET  /transactions (requires JWT)")
    print("  POST /transactions (requires JWT)")
    print("  GET  /transactions/stats (requires JWT)")
    print("  POST /admin/reset (development only - resets database)")
    app.run(debug=True, host='0.0.0.0', port=5000)