from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uname = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(80))

    def to_dict(self):
        return {"uname": self.uname, "role": self.role}

def get_user(username):
    user = User.query.filter_by(uname=username).first()
    return user

def authenticate_user(username, password):
    user = get_user(username)
    if user and check_password_hash(user.password, password):
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
    return jsonify(user.to_dict())

if __name__ == "__main__":
    db.create_all()
    app.run(host="0.0.0.0", port=8000, debug=True)
