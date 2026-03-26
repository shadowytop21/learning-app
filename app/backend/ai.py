import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def generate_roadmap(skill: str, level: str, hours_per_day: float) -> dict:
    """
    Calls the Gemini API to generate a personalized learning roadmap.
    Returns a parsed Python dict matching the RoadmapJSON schema.
    """
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""You are an expert learning coach. Create a detailed personalized learning roadmap for someone who wants to learn: {skill}. Their level: {level}. Available time: {hours_per_day} hours per day.

Return ONLY valid JSON with no markdown, no explanation:
{{
  "title": "string",
  "total_weeks": number,
  "description": "string",
  "stages": [
    {{
      "stage_number": number,
      "title": "string",
      "duration": "string",
      "goal": "string",
      "resources": [
        {{
          "title": "string",
          "url": "string",
          "type": "Video or Article or Course or Book",
          "duration_minutes": number,
          "why": "string"
        }}
      ]
    }}
  ]
}}

Rules:
- Use REAL, working URLs from the internet (YouTube, Coursera, MDN, freeCodeCamp, etc.)
- Each stage should have 3-5 resources
- Create 4-6 stages total based on the skill complexity
- duration_minutes should be a realistic number
- Make the roadmap genuinely useful and actionable"""

    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Strip markdown code fences if Gemini wraps the JSON
    raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
    raw_text = re.sub(r"\s*```$", "", raw_text)
    raw_text = raw_text.strip()

    try:
        roadmap = json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\n\nRaw response:\n{raw_text[:500]}")

    return roadmap
