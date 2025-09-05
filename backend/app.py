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

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

jwt = JWTManager(app)

# Sample data
products = []
users = [
    {
        'id': 1,
        'email': 'demo@inventory.com',
        'password': generate_password_hash('demopassword123'),
        'name': 'Demo User',
        'role': 'admin'
    }
]

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

# Get all products
@app.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    try:
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify(products), 200
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
        
        # Handle image upload
        image_filename = None
        image_data = data.get('image')
        if image_data and image_data.startswith('data:image'):
            image_filename = save_image(image_data, f"product_{data.get('sku', '')}_{uuid.uuid4().hex}.jpg")
        
        new_product = {
            'id': max([p['id'] for p in products], default=0) + 1,
            'name': data['name'],
            'sku': data.get('sku', ''),
            'category': data.get('category', ''),
            'quantity': data['quantity'],
            'min_stock_level': data.get('min_stock_level', 0),
            'price': data['price'],
            'description': data.get('description', ''),
            'status': 'in_stock' if data['quantity'] > 0 else 'out_of_stock',
            'last_updated': datetime.now().isoformat(),
            'image': f"/uploads/{image_filename}" if image_filename else data.get('image')
        }
        
        products.append(new_product)
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
        product['quantity'] = data.get('quantity', product['quantity'])
        product['min_stock_level'] = data.get('min_stock_level', product['min_stock_level'])
        product['price'] = data.get('price', product['price'])
        product['description'] = data.get('description', product['description'])
        product['last_updated'] = datetime.now().isoformat()
        product['image'] = data.get('image', product.get('image'))
        
        # Update status based on quantity
        if product['quantity'] == 0:
            product['status'] = 'out_of_stock'
        elif product['quantity'] <= product['min_stock_level']:
            product['status'] = 'low_stock'
        else:
            product['status'] = 'in_stock'
        
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
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['ID', 'Name', 'SKU', 'Category', 'Quantity', 'Min Stock', 'Price', 'Status'])
        
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
                product.get('status', '')
            ])
        
        # Prepare response
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name='inventory_export.csv'
        )
    except Exception as e:
        return jsonify({'message': 'Failed to export products', 'error': str(e)}), 500

# Get transactions
@app.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    try:
        user_id = get_jwt_identity()
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Return empty array for now
        return jsonify([]), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch transactions', 'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Available endpoints:")
    print("  GET  /health")
    print("  POST /auth/login")
    print("  GET  /products (requires JWT)")
    print("  POST /products (requires JWT)")
    print("  GET  /products/<id> (requires JWT)")
    print("  PUT  /products/<id> (requires JWT)")
    print("  DELETE /products/<id> (requires JWT)")
    print("  GET  /products/export (requires JWT)")
    print("  GET  /uploads/<filename> (serves uploaded images)")
    print("  GET  /transactions (requires JWT)")
    app.run(debug=True, host='0.0.0.0', port=5000)