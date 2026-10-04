from pydantic import BaseModel
from typing import List, Optional
from app.schemas.log import LogEntryBase

class SyncRequest(BaseModel):
    user_id: Optional[str] = "local-user"
    last_sync_timestamp: Optional[str] = None
    entries: List[LogEntryBase]

class SyncResponse(BaseModel):
    status: str
    synced_count: int
    message: str
    server_time: str
