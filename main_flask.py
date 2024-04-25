from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash
from flask_httpauth import HTTPBasicAuth
from flask_cors import CORS

app = Flask(__name__)
auth = HTTPBasicAuth()
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Configure the database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///./test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the User model using SQLAlchemy ORM
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uname = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(80), nullable=True)

# User schema for the login
class LoginSchema:
    def __init__(self, username, password):
        self.username = username
        self.password = password

    @staticmethod
    def from_dict(data):
        return LoginSchema(data['username'], data['password'])

# Get a user by username
def get_user(username):
    return User.query.filter_by(uname=username).first()

# Authenticate the user
def authenticate_user(username, password):
    user = get_user(username)
    if user and check_password_hash(user.password, password):
        return user
    return None

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    login_schema = LoginSchema.from_dict(data)
    user = authenticate_user(login_schema.username, login_schema.password)
    if not user:
        abort(401, description="Incorrect username or password")
    return jsonify(uname=user.uname, role=user.role)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
