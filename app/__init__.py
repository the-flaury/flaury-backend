from app.DB_engine import MongoDBEngine
from app import config  # Import URI and DB_NAME from config.py

# Initialize MongoDB Engine
db_engine = MongoDBEngine(uri=config.URI, db_name=config.DB_NAME)
