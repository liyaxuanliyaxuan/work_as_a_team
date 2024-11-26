from pydantic import BaseModel
from typing import Optional
from enum import Enum

class UserCreate(BaseModel):
    username: str
    password: str
    invite_code: Optional[str] = None

class User(BaseModel):
    username: str
    is_admin: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str

class WorkStatus(str, Enum):
    IDLE = "idle"               # 开始
    GENERATING = "generating"   # 出题中
    ANSWERING = "answering"     # 解答中
    GRADING = "grading"        # 打分中
    TUNING = "tuning"          # 微调中
    EVALUATING = "evaluating"  # 测评中

class WorkStatusResponse(BaseModel):
    status: WorkStatus
    status_name: str

    @staticmethod
    def get_status_name(status: WorkStatus) -> str:
        status_names = {
            WorkStatus.IDLE: "开始",
            WorkStatus.GENERATING: "出题中",
            WorkStatus.ANSWERING: "解答中",
            WorkStatus.GRADING: "打分中",
            WorkStatus.TUNING: "微调中",
            WorkStatus.EVALUATING: "测评中"
        }
        return status_names.get(status, "未知状态")