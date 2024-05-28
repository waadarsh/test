import uuid
from datetime import datetime
from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from pony.orm import Database, Required, Set, PrimaryKey, db_session, commit, select, desc
import psycopg
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage
from langchain_postgres import PostgresChatMessageHistory

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Change this to a random secret key
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Define the database object
db = Database()

# Define the entity classes
class User(db.Entity, UserMixin):
    Uid = PrimaryKey(int, auto=True)
    FirstName = Required(str)
    LastName = Required(str)
    Email = Required(str, unique=True)
    DeptId = Required('Department')
    credentials = Set('UserCredential')
    roles = Set('UserRole')
    IsActive = Required(bool, default=True)
    token_usages = Set('TokenUsage')
    sessions = Set('SessionUserMapping')

class UserCredential(db.Entity):
    CredId = PrimaryKey(int, auto=True)
    Uid = Required(User)
    Password = Required(str)

class Role(db.Entity):
    RoleId = PrimaryKey(int, auto=True)
    RoleName = Required(str)
    users = Set('UserRole')

class Department(db.Entity):
    DeptId = PrimaryKey(int, auto=True)
    DeptName = Required(str)
    users = Set(User)
    roles = Set('UserRole')

class UserRole(db.Entity):
    UserRoleid = PrimaryKey(int, auto=True)
    Uid = Required(User)
    DeptId = Required(Department)
    RoleId = Required(Role)

class TokenUsage(db.Entity):
    TokenId = PrimaryKey(int, auto=True)
    Uid = Required(User)
    ModelName = Required(str)
    UsageTimestamp = Required(datetime, default=datetime.utcnow)
    TokensUsed = Required(int)
    PromptTokens = Required(int)
    CompletionTokens = Required(int)
    TotalCost = Required(float)

class SessionUserMapping(db.Entity):
    id = PrimaryKey(int, auto=True)
    session_id = Required(uuid.UUID, default=uuid.uuid4)
    Uid = Required(User)
    is_active = Required(bool, default=True)
    created_at = Required(datetime, default=datetime.utcnow)

# Connect Pony ORM to the database
db.bind(provider='postgres', user='postgres', password='nissan', host='localhost', database='test')
db.generate_mapping(create_tables=True)

# Establish a synchronous connection to the database
conn_info = "dbname=test user=postgres password=nissan host=localhost"
sync_connection = psycopg.connect(conn_info)

@login_manager.user_loader
def load_user(user_id):
    return User.get(Uid=int(user_id))

@app.route('/login', methods=['POST'])
@db_session
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = User.get(Email=email)
    if not user or not user.IsActive:
        return jsonify({'error': 'Invalid email or user not active'}), 403
    
    user_credential = UserCredential.get(Uid=user.Uid, Password=password)
    if not user_credential:
        return jsonify({'error': 'Invalid password'}), 403

    # Generate a new session ID
    session_id = uuid.uuid4()

    # Mark any existing sessions as inactive
    for mapping in SessionUserMapping.select(lambda m: m.Uid == user and m.is_active):
        mapping.is_active = False

    # Insert the new session
    SessionUserMapping(session_id=session_id, Uid=user, is_active=True)

    # Log the user in
    login_user(user)

    roles = [user_role.RoleId.RoleName for user_role in user.roles][0]

    return jsonify({
        'FirstName': user.FirstName,
        'LastName': user.LastName,
        'Roles': roles,
        'SessionId': str(session_id)
    }), 200

@app.route('/logout', methods=['POST'])
@db_session
@login_required
def logout():
    user_id = current_user.Uid
    user = User.get(Uid=user_id)

    # Mark any existing sessions as inactive
    for mapping in SessionUserMapping.select(lambda m: m.Uid == user and m.is_active):
        mapping.is_active = False

    logout_user()
    commit()

    return jsonify({'message': 'User logged out and session ended'}), 200

@app.route('/chatntalk', methods=['POST'])
@db_session
@login_required
def chatntalk():
    data = request.json
    user_id = current_user.Uid
    session_id = data.get('SessionId')
    model_name = data.get('ModelName')
    tokens_used = data.get('TokensUsed')
    prompt_tokens = data.get('PromptTokens')
    completion_tokens = data.get('CompletionTokens')
    total_cost = data.get('TotalCost')

    user = User.get(Uid=user_id)
    if not user:
        return jsonify({'error': 'Invalid user ID'}), 400

    # Initialize the chat history manager with the session_id
    chat_history = PostgresChatMessageHistory(
        table_name="chat_history",
        session_id=session_id,
        sync_connection=sync_connection
    )

    # Example messages, replace with actual data
    messages = [
        SystemMessage(content="Meow"),
        AIMessage(content="woof"),
        HumanMessage(content="bark"),
    ]

    # Add messages to the chat history
    chat_history.add_messages(messages)

    # Log token usage
    new_usage = TokenUsage(
        Uid=user_id,
        ModelName=model_name,
        TokensUsed=tokens_used,
        PromptTokens=prompt_tokens,
        CompletionTokens=completion_tokens,
        TotalCost=total_cost
    )
    commit()

    return jsonify({'message': 'Token usage and chat history logged'}), 201

@app.route('/sessions/<int:user_id>', methods=['GET'])
@db_session
@login_required
def get_sessions(user_id):
    if current_user.Uid != user_id:
        return jsonify({'error': 'Unauthorized access'}), 403

    user = User.get(Uid=user_id)
    if not user:
        return jsonify({'error': 'Invalid user ID'}), 400

    sessions = select(s for s in SessionUserMapping if s.Uid == user)[:]

    session_list = [{
        'session_id': str(session.session_id),
        'is_active': session.is_active,
        'created_at': session.created_at
    } for session in sessions]

    return jsonify({'sessions': session_list}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
