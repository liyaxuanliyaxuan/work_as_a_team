from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "user_auth_db"
    secret_key: str = "your-secret-key"  # 在生产环境中应该使用环境变量
    admin_invite_code: str = "ADMIN123"  # 在生产环境中应该使用环境变量

settings = Settings()