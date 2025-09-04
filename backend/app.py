from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import os
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import json

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
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

# Public routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/public/products', methods=['GET'])
def get_public_products():
    """Endpoint to test without authentication"""
    try:
        # For testing, return some sample data
        sample_data = [
            {"id": 1, "name": "Test Product 1", "price": 19.99},
            {"id": 2, "name": "Test Product 2", "price": 29.99}
        ]
        return jsonify(sample_data), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch products', 'error': str(e)}), 500

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

# Protected routes - FIXED: Use proper JWT identity handling
@app.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    try:
        # Get the user ID from the token
        user_id = get_jwt_identity()
        
        # Find the user to verify access
        user = next((u for u in users if str(u['id']) == user_id), None)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Return products (add some sample data if empty)
        if not products:
            sample_products = [
                {
                    'id': 1,
                    'name': 'Sample Laptop',
                    'sku': 'LP001',
                    'price': 999.99,
                    'quantity': 10,
                    'category': 'Electronics'
                },
                {
                    'id': 2,
                    'name': 'Wireless Mouse',
                    'sku': 'WM002',
                    'price': 29.99,
                    'quantity': 25,
                    'category': 'Accessories'
                }
            ]
            products.extend(sample_products)
        
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch products', 'error': str(e)}), 500

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
    print("  GET  /public/products")
    print("  POST /auth/login")
    print("  GET  /products (requires JWT)")
    print("  GET  /transactions (requires JWT)")
    app.run(debug=True, host='0.0.0.0', port=5000)