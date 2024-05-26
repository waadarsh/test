from flask import Flask, request, jsonify
from flask_cors import CORS
from pony.orm import Database, Required, Set, PrimaryKey, db_session, select
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

@app.route('/names', methods=['GET'])
@db_session
def get_names():
    query = request.args.get('query', '')
    names = select(u.FirstName for u in User if query in u.FirstName).limit(10)[:]
    return jsonify({'names': names}), 200

@app.route('/models', methods=['GET'])
@db_session
def get_models():
    query = request.args.get('query', '')
    models = select(t.ModelName for t in TokenUsage if query in t.ModelName).limit(10)[:]
    return jsonify({'models': models}), 200

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

    query = TokenUsage.select()

    if first_name_filter:
        query = query.filter(lambda t: t.Uid.FirstName == first_name_filter)
    if date_filter:
        query = query.filter(lambda t: t.UsageTimestamp.date() == datetime.strptime(date_filter, '%Y-%m-%d').date())
    if model_filter:
        query = query.filter(lambda t: t.ModelName == model_filter)
    if department_filter:
        query = query.filter(lambda t: t.Uid.DeptId.DeptName == department_filter)

    total_records = query.count()
    usage_records = query.order_by(desc(TokenUsage.UsageTimestamp)).page(page, per_page)

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

    summary = None
    if any([first_name_filter, date_filter, model_filter, department_filter]):
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
