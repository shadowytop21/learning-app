from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ── Request Models ──────────────────────────────────────────

class RoadmapRequest(BaseModel):
    skill: str
    level: str          # "Beginner" | "Intermediate"
    hours_per_day: float
    user_id: str


class ProgressRequest(BaseModel):
    user_id: str
    roadmap_id: str
    resource_url: str
    completed: bool


# ── Nested Response Models ───────────────────────────────────

class ResourceResponse(BaseModel):
    title: str
    url: str
    type: str           # "Video" | "Article" | "Course" | "Book"
    duration_minutes: int
    why: str


class StageResponse(BaseModel):
    stage_number: int
    title: str
    duration: str
    goal: str
    resources: List[ResourceResponse]


class RoadmapJSON(BaseModel):
    title: str
    total_weeks: int
    description: str
    stages: List[StageResponse]


# ── Top-level Response Models ────────────────────────────────

class RoadmapRecord(BaseModel):
    id: str
    user_id: str
    skill: str
    level: str
    hours_per_day: float
    roadmap_json: Any
    created_at: Optional[str] = None


class ProgressRecord(BaseModel):
    id: Optional[str] = None
    user_id: str
    roadmap_id: str
    resource_url: str
    completed: bool
    updated_at: Optional[str] = None


class GenerateRoadmapResponse(BaseModel):
    roadmap_id: str
    roadmap: Any


class MessageResponse(BaseModel):
    message: str
