from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def create_table():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS reviews(
                id SERIAL PRIMARY KEY,
                contact_number TEXT,
                product_name TEXT,
                user_name TEXT,
                product_review TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """))
        conn.commit()
        
if __name__ == "__main__":
    create_table()
    print("Created table successfully")