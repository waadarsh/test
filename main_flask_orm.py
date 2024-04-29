from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from werkzeug.security import check_password_hash
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Set up CORS
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Base declarative class
Base = declarative_base()

# Initialize SQLAlchemy with the declarative base
db = SQLAlchemy(app, model_class=Base)

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    username: Mapped[str] = mapped_column(db.String(80), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(db.String(120), nullable=False)
    role: Mapped[str] = mapped_column(db.String(80))

    def to_dict(self):
        return {"username": self.username, "role": self.role}

def get_user(username):
    return User.query.filter_by(username=username).first()

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
    with app.app_context():
        Base.metadata.create_all(bind=db.engine)  # Create tables
    app.run(host="0.0.0.0", port=8000, debug=True)
