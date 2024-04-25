from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from database import SessionLocal, User

app = FastAPI()
security = HTTPBasic()

def get_user(db: Session, username: str):
    return db.query(User).filter(User.uname == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or user.password != password:
        return False
    return user

def get_current_user(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(SessionLocal)):
    user = authenticate_user(db, credentials.username, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return user

@app.get("/admin/")
def read_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return {"message": "Admin page"}

@app.get("/user/")
def read_user(user: User = Depends(get_current_user)):
    return {"message": f"Hello, {user.uname}! You are a {user.role}."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
