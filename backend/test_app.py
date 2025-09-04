from flask import Flask, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/public/products', methods=['GET'])
def get_public_products():
    return jsonify([
        {'id': 1, 'name': 'Test Product 1', 'price': 19.99},
        {'id': 2, 'name': 'Test Product 2', 'price': 29.99}
    ])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)