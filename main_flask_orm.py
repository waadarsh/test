from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from pony.orm import Database, Required, PrimaryKey, db_session
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Setup Pony ORM Database
db = Database()

class User(db.Entity):
    id = PrimaryKey(int, auto=True)
    uname = Required(str, unique=True)
    password = Required(str)
    admin = Required(bool)

    @staticmethod
    def get_user_by_username(uname):
        return User.get(uname=uname)

    @staticmethod
    def authenticate_user(uname, password):
        user = User.get_user_by_username(uname)
        if user and check_password_hash(user.password, password):
            return user
        return None

# Bind and create the database
db.bind(provider='sqlite', filename='test.db', create_db=True)
db.generate_mapping(create_tables=True)

@app.route('/login', methods=['POST'])
@db_session
def login():
    data = request.get_json()
    uname = data.get('uname')
    password = data.get('password')
    if not uname or not password:
        abort(400, description="Missing username or password")
    user = User.authenticate_user(uname, password)
    if not user:
        abort(401, description="Incorrect username or password")
    return jsonify(username=user.uname, admin=user.admin)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
