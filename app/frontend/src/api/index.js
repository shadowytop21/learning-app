const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function generateRoadmap({ skill, level, hours_per_day, user_id }) {
  const res = await fetch(`${BASE_URL}/api/generate-roadmap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skill, level, hours_per_day, user_id }),
  });
  return handleResponse(res);
}

export async function getRoadmap(roadmapId) {
  const res = await fetch(`${BASE_URL}/api/roadmap/${roadmapId}`);
  return handleResponse(res);
}

export async function getProgress(userId, roadmapId) {
  const res = await fetch(`${BASE_URL}/api/progress/${userId}/${roadmapId}`);
  return handleResponse(res);
}

export async function saveProgress({ user_id, roadmap_id, resource_url, completed }) {
  const res = await fetch(`${BASE_URL}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, roadmap_id, resource_url, completed }),
  });
  return handleResponse(res);
}

export async function deleteRoadmap(roadmapId) {
  const res = await fetch(`${BASE_URL}/api/roadmap/${roadmapId}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

export async function getUserRoadmaps(userId) {
  const res = await fetch(`${BASE_URL}/api/user/${userId}/roadmaps`);
  return handleResponse(res);
}
