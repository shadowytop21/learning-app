from fastapi import APIRouter, HTTPException
from models import RoadmapRequest, ProgressRequest
from ai import generate_roadmap
import database as db

router = APIRouter()


# ── POST /api/generate-roadmap ───────────────────────────────
@router.post("/api/generate-roadmap")
async def create_roadmap(request: RoadmapRequest):
    """Generate an AI roadmap and persist it to the database."""
    try:
        roadmap = generate_roadmap(
            skill=request.skill,
            level=request.level,
            hours_per_day=request.hours_per_day,
        )
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    try:
        record = db.save_roadmap(
            user_id=request.user_id,
            skill=request.skill,
            level=request.level,
            hours_per_day=request.hours_per_day,
            roadmap_json=roadmap,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database save failed: {str(e)}")

    return {"roadmap_id": record["id"], "roadmap": roadmap}


# ── GET /api/roadmap/{roadmap_id} ────────────────────────────
@router.get("/api/roadmap/{roadmap_id}")
async def fetch_roadmap(roadmap_id: str):
    """Fetch a single roadmap by its ID."""
    try:
        record = db.get_roadmap(roadmap_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if not record:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    return record


# ── GET /api/user/{user_id}/roadmaps ────────────────────────
@router.get("/api/user/{user_id}/roadmaps")
async def fetch_user_roadmaps(user_id: str):
    """Fetch all roadmaps for a given user."""
    try:
        roadmaps = db.get_user_roadmaps(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return roadmaps


# ── POST /api/progress ───────────────────────────────────────
@router.post("/api/progress")
async def upsert_progress(request: ProgressRequest):
    """Save or update a resource completion record."""
    try:
        record = db.save_progress(
            user_id=request.user_id,
            roadmap_id=request.roadmap_id,
            resource_url=request.resource_url,
            completed=request.completed,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return record


# ── GET /api/progress/{user_id}/{roadmap_id} ─────────────────
@router.get("/api/progress/{user_id}/{roadmap_id}")
async def fetch_progress(user_id: str, roadmap_id: str):
    """Get all progress records for a user/roadmap pair."""
    try:
        records = db.get_progress(user_id=user_id, roadmap_id=roadmap_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return records


# ── DELETE /api/roadmap/{roadmap_id} ─────────────────────────
@router.delete("/api/roadmap/{roadmap_id}")
async def remove_roadmap(roadmap_id: str):
    """Delete a roadmap and all associated progress records."""
    try:
        db.delete_roadmap(roadmap_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {"message": "Roadmap deleted successfully"}
