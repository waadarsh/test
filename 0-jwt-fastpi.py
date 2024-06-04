from fastapi import FastAPI, HTTPException, Request, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pony.orm import Database, Required, Set, PrimaryKey, db_session, commit, select, desc
from datetime import datetime, timedelta
import uuid
import uvicorn
import psycopg
from langchain_postgres import PostgresChatMessageHistory
from langchain_core.messages import AIMessage, HumanMessage
import random
from fastapi.middleware.cors import CORSMiddleware
import jwt

# JWT configuration
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
db = Database()

conn_info = "postgresql://postgres:nissan@localhost/test"
sync_connection = psycopg.connect(conn_info)

PostgresChatMessageHistory.create_tables(sync_connection, "chat_history")

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
    chat_history = Set('SessionUserMapping')

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
    SuccessfulRequests = Required(int)
    TotalCost = Required(float)

class SessionUserMapping(db.Entity):
    id = PrimaryKey(int, auto=True)
    session_id = Required(uuid.UUID, default=uuid.uuid4)
    Uid = Required(User)
    IsActive = Required(bool, default=True)
    created_at = Required(datetime, default=datetime.utcnow)

# Connect Pony ORM to the database
db.bind(provider='postgres', user='postgres', password='nissan', host='localhost', database='test')
db.generate_mapping(create_tables=True)

# JWT utilities
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    user = User.get(Uid=payload.get("sub"))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return user

# Endpoints
@app.post("/login", status_code=status.HTTP_200_OK)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with db_session:
        user = User.get(Email=form_data.username)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if not user.IsActive:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")
        user_credential = UserCredential.get(Uid=user.Uid, Password=form_data.password)
        if not user_credential:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={"sub": user.Uid}, expires_delta=access_token_expires)
        
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/protected", status_code=status.HTTP_200_OK)
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": "This is a protected route", "user": current_user.FirstName}

@app.get('/token_usage', status_code=status.HTTP_200_OK)
async def token_usage(request: Request, current_user: User = Depends(get_current_user)):
    params = request.query_params
    try:
        page = int(params.get('page', 1))
        per_page = int(params.get('per_page', 10))
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid page or per_page parameter")

    first_name_filter = params.get('first_name')
    date_filter = params.get('date')
    model_filter = params.get('model')
    department_filter = params.get('department')

    with db_session:
        query = select(t for t in TokenUsage)

        if first_name_filter:
            query = query.where(lambda t: t.Uid.FirstName == first_name_filter)

        if date_filter:
            try:
                date_obj = datetime.strptime(date_filter, '%Y-%m-%d').date()
                query = query.where(lambda t: t.UsageTimestamp.date() == date_obj)
            except ValueError:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format. Use YYYY-MM-DD.")

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

        summary = None
        if date_filter or first_name_filter or model_filter or department_filter:
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

    return {
        'total_records': total_records,
        'page': page,
        'per_page': per_page,
        'data': response_data,
        'summary': summary,
        'departments': departments
    }

@app.post('/createuser', status_code=status.HTTP_201_CREATED)
async def create_user(request: Request, current_user: User = Depends(get_current_user)):
    data = await request.json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = 'test1'
    department_name = data.get('department_name')
    role_name = data.get('role_name')
    with db_session:
        departmant = Department.get(DeptName=department_name)
        role = Role.get(RoleName=role_name)

        if User.get(Email=email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

        new_user = User(FirstName=first_name, LastName=last_name, Email=email, DeptId=departmant)
        new_user.credentials.add(UserCredential(Uid=new_user, Password=password))
        new_user.roles.add(UserRole(Uid=new_user, DeptId=departmant, RoleId=role))
        commit()

    return {'message': 'User created'}

@app.get('/deptrole', status_code=status.HTTP_200_OK)
async def deptrole(current_user: User = Depends(get_current_user)):
    with db_session:
        dapartments = select(d for d in Department)[:]
        roles = select(r for r in Role)[:]

        Department_list = [{'DeptId': dept.DeptId, 'DeptName': dept.DeptName} for dept in dapartments]
        role_list = [{'RoleId': role.RoleId, 'RoleName': role.RoleName} for role in roles if role.RoleName != 'Admin']
        return {'departments': Department_list, 'roles': role_list}

@app.get('/sessions/{user_id}', status_code=status.HTTP_200_OK)
async def get_sessions(user_id, current_user: User = Depends(get_current_user)):
    with db_session:
        user = User.get(Uid=user_id)
        if not user:
            return {"error": "Invalid user ID"}

        sessions = select(s for s in SessionUserMapping if s.Uid == user)[:]
        session_list = [{'session_id': str(session.session_id), 'created_at': session.created_at} for session in sessions]
    return {'sessions': session_list}

@app.get('/users', status_code=status.HTTP_200_OK)
async def users(current_user: User = Depends(get_current_user)):
    with db_session:
        users = select(u for u in UserRole)[:]
        user_list = [{'Uid': user.Uid.Uid, 'FirstName': user.Uid.FirstName, 'LastName': user.Uid.LastName, 'Email': user.Uid.Email, 'DeptName': user.DeptId.DeptName, 'RoleName': user.RoleId.RoleName, 'IsActive': user.Uid.IsActive} for user in users]
    return {'users': user_list}

@app.put('/users', status_code=status.HTTP_200_OK)
async def deleteuser(request: Request, current_user: User = Depends(get_current_user)):
    data = await request.json()
    uid = data.get('Uid')
    with db_session:
        user = User.get(Uid=uid)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        try:
            user.IsActive = False
            commit()
            return {'message': "user deleted"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.put('/edituser', status_code=status.HTTP_200_OK)
async def edituser(request: Request, current_user: User = Depends(get_current_user)):
    data = await request.json()
    uid = data.get('Uid')
    with db_session:
        user = User.get(Uid=uid)
        userrole = UserRole.get(Uid=uid)
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        department_name = data.get('department_name')
        role_name = data.get('role_name')
        is_active = data.get('is_active')
        
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
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
            return {'message': "user details updated"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post('/chatntalk', status_code=status.HTTP_201_CREATED)
async def chatntalk(request: Request, current_user: User = Depends(get_current_user)):
    data = await request.json()
    user_id = data.get('Uid')
    prompt = data.get('prompt')

    model_name = 'gpt4o'
    prompt_tokens = random.randint(10, 15)
    completion_tokens = random.randint(15, 25)
    tokens_used = prompt_tokens + completion_tokens
    successful_requests = 1
    total_cost = round(random.uniform(0.001, 0.8), 3)
    session_id = data.get('SessionId')

    with db_session:
        user = User.get(Uid=user_id)
        session = SessionUserMapping.get(session_id=uuid.UUID(session_id))
        if not session: 
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session ID")

        chat_history = PostgresChatMessageHistory(
            'chat_history',
            str(session_id),
            sync_connection=sync_connection
        )

        chat_history.add_messages([
            HumanMessage(content=prompt),
            AIMessage(content=str(random.randint(15, 25)))
        ])

        new_usage = TokenUsage(
            Uid=user_id,
            ModelName=model_name, 
            TokensUsed=tokens_used,
            PromptTokens=prompt_tokens,
            CompletionTokens=completion_tokens,
            SuccessfulRequests=successful_requests,
            TotalCost=total_cost
        )
        commit()
    return {'message': 'Token usage logged', 'data': prompt}

@app.get('/get_chat_history/{session_id_str}', status_code=status.HTTP_200_OK)
async def get_chat_history(session_id_str, current_user: User = Depends(get_current_user)):
    try:
        session_id = uuid.UUID(session_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session ID format")

    with db_session:
        session = SessionUserMapping.get(session_id=session_id)
        if not session:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session ID")

        chat_history = PostgresChatMessageHistory(
            "chat_history",
            session_id_str,
            sync_connection=sync_connection
        )

        messages = chat_history.get_messages()
        messages_list = [{'AI' if message.type == 'ai' else 'User': message.content} for message in messages]

    return {'messages': messages_list}

@app.post('/new_chat', status_code=status.HTTP_200_OK)
async def new_chat(request: Request, current_user: User = Depends(get_current_user)):
    data = await request.json()
    user_id = data.get('Uid')

    with db_session:
        user = User.get(Uid=user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID")
        
        for mapping in SessionUserMapping.select(lambda m: m.Uid == user and m.IsActive):
            mapping.isActive = False

        session_id = uuid.uuid4()
        new_session = SessionUserMapping(session_id=session_id, Uid=user, IsActive=True)
        commit()

    return {
        'message': 'New session started',
        'sessionid': str(session_id)
    }

if __name__ == "__main__":
    uvicorn.run("fastapi_orm:app", host="127.0.0.1", port=8000, reload=False)
