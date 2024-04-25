# main.py
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, User

app = FastAPI()

# CORS configuration to allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for all origins
    allow_credentials=True,
    allow_methods=["*"],  # or specify methods ["POST", "GET", etc.]
    allow_headers=["*"],
)

# Pydantic model for reading login payload
class LoginSchema(BaseModel):
    username: str
    password: str

# Utility functions to interact with the database
def get_user(db: Session, username: str):
    return db.query(User).filter(User.uname == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or user.password != password:
        return None
    return user

# Endpoint to handle user login
@app.post("/login")
def login(login_schema: LoginSchema, db: Session = Depends(SessionLocal)):
    user = authenticate_user(db, login_schema.username, login_schema.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    return {"uname": user.uname, "role": user.role}

# Endpoint for admin access
@app.get("/admin/")
def read_admin(db: Session = Depends(SessionLocal)):
    # Example of admin-only access control, customize as needed
    user = Depends(get_current_user)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return {"message": "Welcome to the Admin page."}

# Endpoint for regular user access
@app.get("/user/")
def read_user(db: Session = Depends(SessionLocal)):
    user = Depends(get_current_user)
    return {"message": f"Hello, {user.uname}. You are a {user.role}."}

# Utility function to get the current user based on the session
def get_current_user(db: Session = Depends(SessionLocal), username: str = Depends(get_user_from_request)):
    user = get_user(db, username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized access",
            headers={"WWW-Authenticate": "Basic"},
        )
    return user

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
