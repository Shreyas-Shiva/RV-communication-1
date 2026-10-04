from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "COMMUNIQ API"
    app_version: str = "1.0.0"
    api_prefix: str = "/api"
    
    # Storage
    mongo_uri: str = "mongodb://localhost:27017"
    database_name: str = "communiq"
    
    # CORS
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        "http://localhost:3000"
    ]
    
    # Free AI Providers (Configurable from environment)
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    
    # Timeouts and Limits
    ai_timeout_seconds: float = 8.0
    rate_limit_per_minute: int = 30
    cache_ttl_seconds: int = 600

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
