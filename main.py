
from typing import Literal

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


app = FastAPI(title="TrailQuest API")

BASE_DIR = Path(__file__).resolve().parent

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static",
)


@app.get("/app")
def serve_frontend():
    return FileResponse(BASE_DIR / "static" / "index.html")

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "qwen3:4b-q4_K_M"


class QuestRequest(BaseModel):
    duration: Literal[10, 20, 30] = 20
    quest_type: Literal["Nature", "Mindfulness", "Exploration"] = "Nature"


class Quest(BaseModel):
    title: str
    introduction: str
    challenges: list[str] = Field(min_length=3, max_length=5)


@app.get("/")
def home():
    return {"message": "TrailQuest API is running!"}


@app.post("/api/quest", response_model=Quest)
async def generate_quest(request: QuestRequest):
    prompt = f"""
    Create a safe outdoor adventure for one person.

    Duration: {request.duration} minutes
    Theme: {request.quest_type}

    Return a quest with:
    - A short, inviting title
    - One-sentence introduction
    - 3 to 4 short, practical outdoor challenges

    Keep the challenges suitable for a public park.
    Do not require special equipment, trespassing, or approaching wildlife.
    Make the entire quest fit the requested duration.
    """

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You create practical outdoor quests. "
                                "Follow the requested JSON schema exactly."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "format": Quest.model_json_schema(),
                    "stream": False,
                    "think": False,
                },
            )
            response.raise_for_status()

        content = response.json()["message"]["content"]
        return Quest.model_validate_json(content)

    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not get a response from the local AI model.",
        ) from exc
    except (KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail="The AI returned a response we could not process.",
        ) from exc
