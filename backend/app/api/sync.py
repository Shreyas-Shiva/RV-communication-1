from fastapi import APIRouter
from datetime import datetime
from app.schemas.sync import SyncRequest, SyncResponse
from app.database.mongodb import db_manager

router = APIRouter(tags=["sync"])

@router.post("/sync", response_model=SyncResponse)
async def sync_logs(request: SyncRequest):
    synced_count = 0
    if db_manager.is_connected() and db_manager.db is not None:
        try:
            collection = db_manager.db["activity_logs"]  # type: ignore
            records = [entry.model_dump() for entry in request.entries]
            if records:
                result = await collection.insert_many(records)
                synced_count = len(result.inserted_ids)
            return SyncResponse(
                status="success",
                synced_count=synced_count,
                message="Synced logs to MongoDB successfully.",
                server_time=datetime.utcnow().isoformat()
            )
        except Exception as error:
            return SyncResponse(
                status="partial",
                synced_count=0,
                message=f"Sync failed with error: {str(error)}. Client will keep data locally.",
                server_time=datetime.utcnow().isoformat()
            )

    return SyncResponse(
        status="offline",
        synced_count=0,
        message="Backend running without remote database. All data safely preserved in client IndexedDB.",
        server_time=datetime.utcnow().isoformat()
    )
