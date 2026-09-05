import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load .env file if present
env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(env_file):
    with open(env_file, "r") as f:
        for line in f:
            if line.strip() and not line.startswith("#") and "=" in line:
                key, val = line.strip().split("=", 1)
                os.environ[key.strip()] = val.strip().strip('"').strip("'")

# Get DATABASE_URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./task_manager.db")

# Fix legacy postgres:// prefix if present
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Safely encode special characters like @ in PostgreSQL passwords if unencoded
if SQLALCHEMY_DATABASE_URL.startswith("postgresql://") and "@" in SQLALCHEMY_DATABASE_URL:
    try:
        prefix, rest = SQLALCHEMY_DATABASE_URL.split("://", 1)
        if "@" in rest:
            user_pass, host_db = rest.rsplit("@", 1)
            if ":" in user_pass:
                user, password = user_pass.split(":", 1)
                if "%" not in password:
                    encoded_password = urllib.parse.quote_plus(password)
                    SQLALCHEMY_DATABASE_URL = f"{prefix}://{user}:{encoded_password}@{host_db}"
    except Exception:
        pass

# Enable SSL mode for remote PostgreSQL (Supabase / Render / Neon) if not specified
if SQLALCHEMY_DATABASE_URL.startswith("postgresql://") and "sslmode" not in SQLALCHEMY_DATABASE_URL:
    if "?" in SQLALCHEMY_DATABASE_URL:
        SQLALCHEMY_DATABASE_URL += "&sslmode=require"
    else:
        SQLALCHEMY_DATABASE_URL += "?sslmode=require"

connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,
}

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    engine_kwargs["pool_recycle"] = 300
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10

# Attempt engine creation with automatic fallback to local SQLite if remote DB is unreachable
try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args, **engine_kwargs)
    with engine.connect() as test_conn:
        print("Connected to primary database successfully.")
except Exception as err:
    print(f"Notice: Unable to connect to primary DB ({err}). Falling back to local SQLite database.")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./task_manager.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
