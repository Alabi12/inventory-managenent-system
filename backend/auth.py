from flask import request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from models import Database
import sqlite3

jwt = JWTManager()

def init_auth(app):
    jwt.init_app(app)
    app.config['JWT_SECRET_KEY'] = 'your-super-secret-key-change-in-production'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

def role_required(roles):
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            current_user = get_jwt_identity()
            db = Database()
            user = db.conn.execute(
                "SELECT role FROM users WHERE username = ?", (current_user,)
            ).fetchone()
            
            if not user or user['role'] not in roles:
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def setup_auth_routes(app):
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        db = Database()
        user = db.conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            access_token = create_access_token(identity=username)
            return jsonify({
                'access_token': access_token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'role': user['role']
                }
            })
        
        return jsonify({'error': 'Invalid credentials'}), 401

    @app.route('/api/auth/register', methods=['POST'])
    @jwt_required()
    @role_required(['admin'])
    def register():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        role = data.get('role', 'user')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        db = Database()
        try:
            db.conn.execute(
                "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                (username, generate_password_hash(password), role)
            )
            db.conn.commit()
            return jsonify({'message': 'User created successfully'}), 201
        except sqlite3.IntegrityError:
            return jsonify({'error': 'Username already exists'}), 400

    @app.route('/api/auth/profile', methods=['GET'])
    @jwt_required()
    def get_profile():
        current_user = get_jwt_identity()
        db = Database()
        user = db.conn.execute(
            "SELECT id, username, role, created_at FROM users WHERE username = ?", (current_user,)
        ).fetchone()
        
        if user:
            return jsonify(dict(user))
        return jsonify({'error': 'User not found'}), 404