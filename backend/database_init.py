from models import Database

def init_database():
    """Initialize the database with sample data"""
    db = Database()
    print("Database initialized successfully")
    return db

if __name__ == "__main__":
    init_database()