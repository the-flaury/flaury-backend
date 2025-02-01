import os
from dotenv import load_dotenv


# Load environment variables from .env
load_dotenv()

# Check if production mode is enabled
PRODUCTION = os.getenv("PRODUCTION", "false").lower() == "true"

# Read database credentials from environment
MONGO_USER = os.getenv("MONGO_USER", "default_user")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "default_password")
MONGO_HOST = os.getenv("MONGO_HOST", "localhost")
MONGO_DB = os.getenv("MONGO_DB", "my_flask_api")
MONGO_OPTIONS = os.getenv("MONGO_OPTIONS", "")

# Read Flask Secret Key
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")

# Construct MongoDB URI
if PRODUCTION:
    URI = f"mongodb+srv://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}/{MONGO_DB}{MONGO_OPTIONS}"
    DB_NAME = MONGO_DB
else:
    URI = "mongodb://mongo:27017"
    DB_NAME = "my_flask_api"
