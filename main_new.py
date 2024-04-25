# main.py
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, User
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
security = HTTPBasic()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginSchema(BaseModel):
    username: str
    password: str

def get_user(db: Session, username: str):
    return db.query(User).filter(User.uname == username).first()

def authenticate_user(db: Session, credentials: HTTPBasicCredentials):
    user = get_user(db, credentials.username)
    if not user or user.password != credentials.password:
        return None
    return user

def get_current_user(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(SessionLocal)):
    user = authenticate_user(db, credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"}
        )
    return user

@app.post("/login")
def login(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(SessionLocal)):
    user = get_current_user(credentials=credentials, db=db)
    return {"uname": user.uname, "role": user.role}

@app.get("/admin/")
def read_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return {"message": "Welcome to the Admin page."}

@app.get("/user/")
def read_user(user: User = Depends(get_current_user)):
    return {"message": f"Hello, {user.uname}. You are a {user.role}."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
