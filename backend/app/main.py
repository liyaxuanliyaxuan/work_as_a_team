from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
from .models import UserCreate, User, Token, WorkStatus, WorkStatusResponse
from .auth import get_password_hash, verify_password, create_access_token
from typing import Optional
from jose import JWTError, jwt
import time

app = FastAPI()

# 更新 CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 允许的前端地址
    allow_credentials=True,  # 必须启用以支持带身份验证的请求
    allow_methods=["*"],  # 允许所有 HTTP 方法
    allow_headers=["*"],  # 允许所有头部
)

# 数据库连接
@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(settings.mongodb_url)
    app.mongodb = app.mongodb_client[settings.database_name]

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

# 认证路由
@app.post("/api/auth/register", response_model=User)
async def register(user: UserCreate):
    if await app.mongodb.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    is_admin = user.invite_code == settings.admin_invite_code
    
    user_dict = {
        "username": user.username,
        "password": get_password_hash(user.password),
        "is_admin": is_admin
    }
    
    await app.mongodb.users.insert_one(user_dict)
    return User(username=user.username, is_admin=is_admin)

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserCreate):
    db_user = await app.mongodb.users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=access_token, token_type="bearer")

@app.get("/api/auth/check")
async def check_auth():
    # 这里可以添加token验证逻辑
    return {"status": "ok"}

@app.options("/api/test")
async def preflight_check():
    return {"message": "Preflight response"}

# 添加获取当前用户的依赖函数
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未登录")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="无效的认证信息")
    except JWTError:
        raise HTTPException(status_code=401, detail="无效的认证信息")
    
    user = await app.mongodb.users.find_one({"username": username})
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")
    
    return User(username=user["username"], is_admin=user["is_admin"])

# 添加获取当前用户信息的路由
@app.get("/api/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# 添加一个简单的状态循环模拟
def get_mock_status() -> WorkStatus:
    # 使用时间戳来循环状态
    statuses = list(WorkStatus)
    current_time = int(time.time())
    index = (current_time // 5) % len(statuses)  # 每5秒切换一次状态
    return statuses[index]

# 添加获取工作状态的路由
@app.get("/api/work/status", response_model=WorkStatusResponse)
async def get_work_status(current_user: User = Depends(get_current_user)):
    current_status = get_mock_status()
    return WorkStatusResponse(
        status=current_status,
        status_name=WorkStatusResponse.get_status_name(current_status)
    )
