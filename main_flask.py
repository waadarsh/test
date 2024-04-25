from flask import Flask, request, jsonify, abort
import sqlite3
from werkzeug.security import check_password_hash
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

def get_db_connection():
    conn = sqlite3.connect('mydatabase.db')
    conn.row_factory = sqlite3.Row  # This enables column access by name: row['column_name']
    return conn

def get_user(username):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM User WHERE uname = ?', (username,)).fetchone()
    conn.close()
    return user

def authenticate_user(username, password):
    user = get_user(username)
    if user and check_password_hash(user['password'], password):
        return user
    return None

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        abort(400, description="Missing username or password")

    user = authenticate_user(username, password)
    if not user:
        abort(401, description="Incorrect username or password")
    return jsonify(uname=user['uname'], role=user.get('role'))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
