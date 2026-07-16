"""
Async MongoDB Connector Pattern
------------------------------
Demonstrates non-blocking connection pool management using Motor and FastAPI lifecycle events.
NOTE: Sensitive database credentials are loaded exclusively via environment variables.
"""

import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# Load connection URI safely without hardcoding secrets
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/sample_db")

# Initialize the async Motor client connection pool
client: AsyncIOMotorClient = AsyncIOMotorClient(MONGO_URI)

# Expose database and collection references
db = client["portfolio_db"]

# Async collections exported for use across APIRouter endpoints
projects_collection = db["projects"]
skills_collection = db["skills"]
publications_collection = db["publications"]
experience_collection = db["experience"]
education_collection = db["education"]
achievements_collection = db["achievements"]
users_collection = db["users"]
