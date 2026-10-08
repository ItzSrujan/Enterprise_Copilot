from backend.app.db.base import Base
from backend.app.db.database import engine
from backend.app.models import Chunk

def main():
    Base.metadata.create_all(bind = engine)
    
    print("Database tables created successfully")
    
if __name__ == "__main__":
    main()