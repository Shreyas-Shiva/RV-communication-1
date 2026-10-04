import logging
from typing import Optional

try:
    from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
except ImportError:
    AsyncIOMotorClient = None  # type: ignore
    AsyncIOMotorDatabase = None  # type: ignore

from app.config.settings import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: Optional[object] = None
    db: Optional[object] = None

    async def connect(self) -> None:
        if AsyncIOMotorClient is None:
            logger.warning("motor library not installed. Database sync will remain inactive.")
            return

        try:
            self.client = AsyncIOMotorClient(settings.mongo_uri, serverSelectionTimeoutMS=2000)
            self.db = self.client[settings.database_name]
            # Ping database to check connection
            await self.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully.")
        except Exception as error:
            logger.warning("MongoDB not reachable: %s. Continuing in offline mode.", error)
            self.client = None
            self.db = None

    async def disconnect(self) -> None:
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed.")

    def is_connected(self) -> bool:
        return self.db is not None

db_manager = DatabaseManager()
