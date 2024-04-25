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

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or user.password != password:
        return None
    return user

@app.post("/login")
def login(login_schema: LoginSchema, db: Session = Depends(SessionLocal)):
    user = authenticate_user(db, login_schema.username, login_schema.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"}
        )
    return {"uname": user.uname, "role": user.role}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
