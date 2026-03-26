import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ── Roadmap CRUD ─────────────────────────────────────────────

def save_roadmap(
    user_id: str,
    skill: str,
    level: str,
    hours_per_day: float,
    roadmap_json: dict,
) -> dict:
    """Insert a new roadmap record; returns the saved row."""
    response = (
        supabase.table("roadmaps")
        .insert(
            {
                "user_id": user_id,
                "skill": skill,
                "level": level,
                "hours_per_day": hours_per_day,
                "roadmap_json": roadmap_json,
            }
        )
        .execute()
    )
    return response.data[0]


def get_roadmap(roadmap_id: str) -> dict | None:
    """Fetch a single roadmap by its UUID."""
    response = (
        supabase.table("roadmaps")
        .select("*")
        .eq("id", roadmap_id)
        .single()
        .execute()
    )
    return response.data


def get_user_roadmaps(user_id: str) -> list[dict]:
    """Fetch all roadmaps belonging to a user, newest first."""
    response = (
        supabase.table("roadmaps")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


def delete_roadmap(roadmap_id: str) -> dict:
    """
    Delete a roadmap and its associated progress records.
    The progress rows are removed automatically via the
    ON DELETE CASCADE foreign-key constraint.
    """
    response = (
        supabase.table("roadmaps")
        .delete()
        .eq("id", roadmap_id)
        .execute()
    )
    return response.data


# ── Progress CRUD ────────────────────────────────────────────

def save_progress(
    user_id: str,
    roadmap_id: str,
    resource_url: str,
    completed: bool,
) -> dict:
    """
    Upsert a progress record.
    The unique constraint is on (user_id, roadmap_id, resource_url).
    """
    response = (
        supabase.table("progress")
        .upsert(
            {
                "user_id": user_id,
                "roadmap_id": roadmap_id,
                "resource_url": resource_url,
                "completed": completed,
                "updated_at": "now()",
            },
            on_conflict="user_id,roadmap_id,resource_url",
        )
        .execute()
    )
    return response.data[0]


def get_progress(user_id: str, roadmap_id: str) -> list[dict]:
    """Return all progress records for a user/roadmap pair."""
    response = (
        supabase.table("progress")
        .select("*")
        .eq("user_id", user_id)
        .eq("roadmap_id", roadmap_id)
        .execute()
    )
    return response.data
