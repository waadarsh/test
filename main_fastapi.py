from pony.orm import Database, Required, Set, PrimaryKey, db_session, commit, select
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List

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

# Connect Pony ORM to the database
db.bind(provider='postgres', user='postgres', password='nissan', host='localhost', database='test')

# Generate the mapping
db.generate_mapping(create_tables=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/login", status_code=status.HTTP_200_OK)
@db_session
async def login(request: Request):
    data = await request.json()
    email = data.get('email')
    password = data.get('password')
    user = User.get(Email=email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such user exists")
    
    user_credential = UserCredential.get(Uid=user.Uid, Password=password)
    if not user_credential:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Password")
    
    roles = [user_role.RoleId.RoleName for user_role in user.roles]

    return {
        "FirstName": user.FirstName,
        "LastName": user.LastName,
        "Roles": roles,
    }

@app.post("/createuser", status_code=status.HTTP_201_CREATED)
@db_session
async def create_user(request: Request):
    data = await request.json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = "test1"
    department_name = data.get('department_name')
    role_name = data.get('role_name')

    # Find department by name
    department = Department.get(DeptName=department_name)

    # Find Role
    role = Role.get(RoleName=role_name)

    # Check if email already exists
    if User.get(Email=email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # Create new user
    new_user = User(FirstName=first_name, LastName=last_name, Email=email, DeptId=department)
    new_user.credentials.add(UserCredential(Uid=new_user, Password=password))
    new_user.roles.add(UserRole(Uid=new_user, DeptId=department, RoleId=role))
    commit()

    return {"success": "User created"}

@app.get("/deptrole", status_code=status.HTTP_200_OK)
@db_session
async def deptrole():
    departments = select(d for d in Department)[:]
    roles = select(r for r in Role)[:]

    department_list = [{"DeptId": dept.DeptId, "DeptName": dept.DeptName} for dept in departments]
    role_list = [{"RoleId": role.RoleId, "RoleName": role.RoleName} for role in roles]

    return {"departments": department_list, "roles": role_list}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, debug=True)
