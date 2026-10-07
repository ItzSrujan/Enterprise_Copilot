from sqlalchemy.orm import sessionmaker
from backend.app.db.database import engine

SessionLocal = sessionmaker(
    bind = engine,
    autoflush = False,
    autocommit = False
)