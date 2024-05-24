from pony.orm import Database, Required, Set, PrimaryKey, db_session, commit, select, desc
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Define the database object
db = Database()

# Define the entity classes
class User(db.Entity):
    Uid = PrimaryKey(int, auto=True)
    FirstName = Required(str)
    LastName = Required(str)
    Email = Required(str, unique=True)
    DeptId = Required('Department')
    credentials = Set('UserCredential')
    roles = Set('UserRole')
    IsActive = Required(bool, default=True)
    token_usages = Set('TokenUsage')

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

# Connect Pony ORM to the database
db.bind(provider='postgres', user='postgres', password='nissan', host='localhost', database='test')

# Generate the mapping
db.generate_mapping(create_tables=True)

@app.route('/login', methods=['POST'])
@db_session
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = User.get(Email=email)
    if not user:
        return jsonify({'error': 'No such user exists'}), 404
    if not user.IsActive:
        return jsonify({'error': 'User is not active'}), 403
    user_credential = UserCredential.get(Uid=user.Uid, Password=password)
    if not user_credential:
        return jsonify({'error': 'Invalid Password'}), 404

    roles = [user_role.RoleId.RoleName for user_role in user.roles][0]

    return jsonify({
        'FirstName': user.FirstName,
        'LastName': user.LastName,
        'Roles': roles
    }), 200

@app.route('/createuser', methods=['POST'])
@db_session
def create_user():
    data = request.json
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = 'test1'
    department_name = data.get('department_name')
    role_name = data.get('role_name')

    # Find department by name
    department = Department.get(DeptName=department_name)

    # Find Role
    role = Role.get(RoleName=role_name)

    # Check if email already exists
    if User.get(Email=email):
        return jsonify({'message': 'Email already registered'}), 409

    # Create new user
    new_user = User(FirstName=first_name, LastName=last_name, Email=email, DeptId=department)
    new_user.credentials.add(UserCredential(Uid=new_user, Password=password))
    new_user.roles.add(UserRole(Uid=new_user, DeptId=department, RoleId=role))
    commit()

    return jsonify({'message': 'User created'}), 201

@app.route('/deptrole', methods=['GET'])
@db_session
def deptrole():
    departments = select(d for d in Department)[:]
    roles = select(r for r in Role)[:]

    Department_list = [{'DeptId': dept.DeptId, 'DeptName': dept.DeptName} for dept in departments]
    role_list = [{'RoleId': role.RoleId, 'RoleName': role.RoleName} for role in roles if role.RoleName != 'Admin']

    return jsonify({'departments': Department_list, 'roles': role_list}), 200

@app.route('/users', methods=['GET'])
@db_session
def users():
    users = select(u for u in UserRole)[:]

    user_list = [{'Uid': user.Uid.Uid, 'FirstName': user.Uid.FirstName, 'LastName': user.Uid.LastName, 'Email': user.Uid.Email, 'DeptName': user.DeptId.DeptName, 'RoleName': user.RoleId.RoleName, 'IsActive': user.Uid.IsActive} for user in users]
    return jsonify({'users': user_list}), 200

@app.route('/users', methods=['PUT'])
@db_session
def deleteuser():
    data = request.json
    uid = data.get('Uid')
    user = User.get(Uid=uid)
    if not user:
        return jsonify({'message': "user not found"}), 404
    try:
        user.IsActive = False
        commit()
        return jsonify({'message': "user deleted"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/edituser', methods=['PUT'])
@db_session
def edituser():
    data = request.json
    uid = data.get('Uid')
    user = User.get(Uid=uid)
    userrole = UserRole.get(Uid=uid)
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    department_name = data.get('department_name')
    role_name = data.get('role_name')
    is_active = data.get('is_active')

    if not user:
        return jsonify({'message': "user not found"}), 404
    try:
        if first_name:
            user.FirstName = first_name
        if last_name:
            user.LastName = last_name
        if email:
            user.Email = email
        if department_name:
            department = Department.get(DeptName=department_name)
            if department:
                user.DeptId = department
                userrole.DeptId = department
        if role_name:
            role = Role.get(RoleName=role_name)
            if role:
                userrole.RoleId = role
        if is_active is not None:
            user.IsActive = is_active

        commit()
        return jsonify({'message': "user details updated"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chatntalk', methods=['POST'])
@db_session
def chatntalk():
    # client side
    data = request.json
    user_id = data.get('Uid')
    # prompt = data.get('Prompt')

    # Assuming you have the necessary Langchain setup
    # from langchain.llms import OpenAI
    # from langchain.callbacks import get_openai_callback

    # llm = OpenAI(api_key="your_openai_api_key")  # Initialize the LLM with your API key

    # with get_openai_callback() as cb:
    #     result = llm.invoke(prompt)
    #     print(cb)

    # Extracting the details from the callback
    # tokens_used = cb.total_tokens
    # prompt_tokens = cb.prompt_tokens
    # completion_tokens = cb.completion_tokens
    # successful_requests = cb.successful_requests
    # total_cost = cb.total_cost

    # Testing for postman
    model_name = data.get('ModelName')
    tokens_used = data.get('TokensUsed')
    prompt_tokens = data.get('PromptTokens')
    completion_tokens = data.get('CompletionTokens')
    total_cost = data.get('TotalCost')

    new_usage = TokenUsage(
        Uid=user_id,
        ModelName=model_name,
        TokensUsed=tokens_used,
        PromptTokens=prompt_tokens,
        CompletionTokens=completion_tokens,
        TotalCost=total_cost
    )
    commit()

    return jsonify({'message': 'Token usage logged'}), 201

@app.route('/token_usage', methods=['GET'])
@db_session
def token_usage():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
    except ValueError:
        return jsonify({'error': 'Invalid page or per_page parameter'}), 400

    first_name_filter = request.args.get('first_name')
    date_filter = request.args.get('date')
    model_filter = request.args.get('model')
    department_filter = request.args.get('department')

    query = select(t for t in TokenUsage)

    if first_name_filter:
        query = query.where(lambda t: t.Uid.FirstName == first_name_filter)

    if date_filter:
        query = query.where(lambda t: t.UsageTimestamp.date() == datetime.strptime(date_filter, '%Y-%m-%d').date())

    if model_filter:
        query = query.where(lambda t: t.ModelName == model_filter)

    if department_filter:
        query = query.where(lambda t: t.Uid.DeptId.DeptName == department_filter)

    total_records = query.count()
    usage_records = query.order_by(desc(TokenUsage.UsageTimestamp))[(page - 1) * per_page: page * per_page]

    response_data = [{
        'FirstName': usage.Uid.FirstName,
        'LastName': usage.Uid.LastName,
        'Email': usage.Uid.Email,
        'UsageTimestamp': usage.UsageTimestamp,
        'TokensUsed': usage.TokensUsed,
        'PromptTokens': usage.PromptTokens,
        'CompletionTokens': usage.CompletionTokens,
        'ModelName': usage.ModelName,
        'TotalCost': usage.TotalCost,
        'Department': usage.Uid.DeptId.DeptName
    } for usage in usage_records]

    if date_filter:
        total_tokens_used = sum(usage.TokensUsed for usage in query)
        total_prompt_tokens = sum(usage.PromptTokens for usage in query)
        total_completion_tokens = sum(usage.CompletionTokens for usage in query)
        total_price = sum(usage.TotalCost for usage in query)
        summary = {
            'total_tokens_used': total_tokens_used,
            'total_prompt_tokens': total_prompt_tokens,
            'total_completion_tokens': total_completion_tokens,
            'total_price': total_price
        }
    else:
        summary = None

    departments = [d.DeptName for d in Department.select()]

    return jsonify({
        'total_records': total_records,
        'page': page,
        'per_page': per_page,
        'data': response_data,
        'summary': summary,
        'departments': departments
    }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
