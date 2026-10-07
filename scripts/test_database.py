from backend.app.db.database import engine
from sqlalchemy import text

def main():
    with engine.connect() as connection:
        
        result = connection.execute(
            text("SELECT 1")
        )
        
        print("Database connection successful")
        print("Result:", result.scalar())

if __name__ == "__main__":
    main()