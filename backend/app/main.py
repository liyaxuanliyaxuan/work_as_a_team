from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
from .models import UserCreate, User, Token, WorkStatus, WorkStatusResponse
from .auth import get_password_hash, verify_password, create_access_token
from typing import Optional, List, Dict
from jose import JWTError, jwt
from fastapi import Form
import time
from pydantic import BaseModel
import json
import asyncio
import random
import os
from datetime import datetime

app = FastAPI()

# 更新 CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 允许的前端地址
    allow_credentials=True,  # 必须启用以支持带身份验证的请求
    allow_methods=["*"],  # 允许所有 HTTP 方法
    allow_headers=["*"],  # 允许所有头部
)

current_status = WorkStatus.IDLE
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
    # index = (current_time // 5) % len(statuses)  # 每5秒切换一次状态
    index = 0
    return statuses[index]

# 存储当前的答案数据
current_answer_data: Dict = {}
ANSWERS_FILE_PATH = "answers.json"

# Mock一些答案模板
MOCK_ANSWER_TEMPLATES = [
    "从{}的角度来看，答案是...",
    "基于{}的原理，我们可以得出...",
    "通过{}的方法，可以解决这个问题...",
    "结合{}的特点，答案应该是..."
]

async def generate_answers():
    global current_answer_data, current_status
    current_answer_data = {}

    # 读取之前生成的问题
    with open(QA_FILE_PATH, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # 创建新的答案文件
    if os.path.exists(ANSWERS_FILE_PATH):
        os.remove(ANSWERS_FILE_PATH)
    
    with open(ANSWERS_FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump([], f, ensure_ascii=False, indent=2)

    all_answers = []
    for qa_pair in questions:
        # 为每个问题生成4个不同的答案
        answers = {
            "question": qa_pair["question"],
            "answer1": MOCK_ANSWER_TEMPLATES[0].format(random.choice(MOCK_TOPICS)),
            "answer2": MOCK_ANSWER_TEMPLATES[1].format(random.choice(MOCK_TOPICS)),
            "answer3": MOCK_ANSWER_TEMPLATES[2].format(random.choice(MOCK_TOPICS)),
            "answer4": MOCK_ANSWER_TEMPLATES[3].format(random.choice(MOCK_TOPICS))
        }
        all_answers.append(answers)

        # 写入文件
        with open(ANSWERS_FILE_PATH, 'r+', encoding='utf-8') as f:
            data = json.load(f)
            data.append(answers)
            f.seek(0)
            json.dump(data, ensure_ascii=False, indent=2, fp=f)

        # 更新当前答案数据
        current_answer_data = answers
        await asyncio.sleep(1)

    # 完成后更新状态
    current_status = WorkStatus.GRADING
    return all_answers

# 存储当前的评分数据
current_score_data: Dict = {}
SCORES_FILE_PATH = "scores.json"

async def generate_scores():
    global current_score_data, current_status
    current_score_data = {}

    # 读取之前生成的答案
    with open(ANSWERS_FILE_PATH, 'r', encoding='utf-8') as f:
        answers = json.load(f)

    # 创建新的评分文件
    if os.path.exists(SCORES_FILE_PATH):
        os.remove(SCORES_FILE_PATH)
    
    with open(SCORES_FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump([], f, ensure_ascii=False, indent=2)

    all_scores = []
    for answer_data in answers:
        # 为每个答案生成评分
        scores = {
            "question": answer_data["question"],
            "answer1": answer_data["answer1"],
            "answer2": answer_data["answer2"],
            "answer3": answer_data["answer3"],
            "answer4": answer_data["answer4"],
            "score1": f"{random.uniform(60, 100):.1f}",
            "score2": f"{random.uniform(60, 100):.1f}",
            "score3": f"{random.uniform(60, 100):.1f}",
            "score4": f"{random.uniform(60, 100):.1f}"
        }
        all_scores.append(scores)

        # 写入文件
        with open(SCORES_FILE_PATH, 'r+', encoding='utf-8') as f:
            data = json.load(f)
            data.append(scores)
            f.seek(0)
            json.dump(data, ensure_ascii=False, indent=2, fp=f)

        # 更新当前评分数据
        current_score_data = scores
        await asyncio.sleep(1)

    # 完成后更新状态
    current_status = WorkStatus.TUNING
    return all_scores

# 添加获取当前评分的接口
@app.get("/api/scores/current")
async def get_current_scores():
    return current_score_data

# 修改状态接口，在状态变为ANSWERING时启动答案生成
@app.get("/api/work/status", response_model=WorkStatusResponse)
async def get_work_status(current_user: User = Depends(get_current_user)):
    global current_status
    if current_status == WorkStatus.ANSWERING:
        # 启动答案生成过程
        asyncio.create_task(generate_answers())
    if current_status == WorkStatus.GRADING:
        # 启动评分生成过程
        asyncio.create_task(generate_scores())
    if current_status == WorkStatus.TUNING:
        # 启动进度更新过程
        asyncio.create_task(update_tuning_progress())
        


        
    return WorkStatusResponse(
        status=current_status,
        status_name=WorkStatusResponse.get_status_name(current_status)
    )

# 添加获取当前答案的接口
@app.get("/api/answers/current")
async def get_current_answers():
    return current_answer_data

# Mock 文件路径列表
MOCK_FILE_PATHS = [
    "/data/corpus/file1.txt",
    "/data/corpus/file2.txt",
    "/data/corpus/subdirectory/file3.txt",
    "/data/corpus/large_file.txt",
    "/data/corpus/special/test_cases.txt"
]

# 获取文件路径列表的接口
@app.get("/api/files/paths", response_model=List[str])
async def get_file_paths(current_user: User = Depends(get_current_user)):
    return MOCK_FILE_PATHS

# 添加请求体模型
class FilePathRequest(BaseModel):
    file_path: str

# 修改接收文件路径的接口
@app.post("")
async def select_file(request: FilePathRequest, current_user: User = Depends(get_current_user)):
    print(f"Selected file path: {request.file_path}")  # 打印接收到的文件路径
    return {"message": "File path received", "path": request.file_path}

# 存储当前的QA对
current_qa_pairs: List[Dict[str, str]] = []
TOTAL_QA_PAIRS = 20
BATCH_SIZE = 5
QA_FILE_PATH = "qa_pairs.json"


# Mock一些问题和答案模板
MOCK_QUESTIONS = [
    "请解释{}的概念",
    "如何实现{}功能",
    "分析{}的优缺点",
    "比较{}和{}的区别",
    "举例说明{}的应用场景"
]

MOCK_TOPICS = [
    "机器学习", "深度学习", "自然语言处理", "计算机视觉",
    "强化学习", "神经网络", "数据挖掘", "人工智能"
]

async def generate_qa_pairs():
    global current_qa_pairs, current_status
    current_qa_pairs = []
    all_pairs = []
    
    if os.path.exists(QA_FILE_PATH):
        os.remove(QA_FILE_PATH)
    
    with open(QA_FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump([], f, ensure_ascii=False, indent=2)

    for i in range(TOTAL_QA_PAIRS):
        question_template = random.choice(MOCK_QUESTIONS)
        topics = random.sample(MOCK_TOPICS, 2)
        question = question_template.format(*topics)
        answer = f"这是关于{topics[0]}的详细解答..."

        qa_pair = {"question": question, "answer": answer}
        all_pairs.append(qa_pair)

        with open(QA_FILE_PATH, 'r+', encoding='utf-8') as f:
            data = json.load(f)
            data.append(qa_pair)
            f.seek(0)
            json.dump(data, ensure_ascii=False, indent=2, fp=f)

        if len(all_pairs) % BATCH_SIZE == 0:
            start_idx = len(all_pairs) - BATCH_SIZE
            current_qa_pairs = all_pairs[start_idx:]
            
        await asyncio.sleep(1)

    # 所有QA对生成完成后，更新状态为ANSWERING
    current_status = WorkStatus.ANSWERING
    return all_pairs



@app.post("/api/files/select")
async def select_file(request: FilePathRequest, current_user: User = Depends(get_current_user)):
    print(f"Selected file path: {request.file_path}")
    # 启动QA对生成过程
    asyncio.create_task(generate_qa_pairs())
    global current_status
    current_status=WorkStatus.GENERATING
    return {"message": "Started generating QA pairs"}

# 添加获取当前QA对的接口
@app.get("/api/qa/current")
async def get_current_qa():
    return {"qa_pairs": current_qa_pairs}


# 存储当前的微调进度
current_tuning_progress = 0

async def update_tuning_progress():
    global current_tuning_progress, current_status
    current_tuning_progress = 0
    
    # 每秒增加20%，直到100%
    while current_tuning_progress < 100:
        await asyncio.sleep(1)
        current_tuning_progress = min(current_tuning_progress + 20, 100)
        
        # 当进度达到100%时，更新状态
        if current_tuning_progress >= 100:
            current_status = WorkStatus.EVALUATING
            break

# 添加获取微调进度的接口
@app.get("/api/tuning/progress")
async def get_tuning_progress():
    return {
        "progress": current_tuning_progress,
        "message": f"模型微调进度：{current_tuning_progress}%"
    }