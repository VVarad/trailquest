# 🌿 TrailQuest

**Less scrolling. More exploring.**

TrailQuest is a local AI-powered outdoor adventure generator built for the **“Touch Grass”** open-source AI challenge. Choose a duration and theme to generate small, practical quests that encourage you to get outside.

## ✨ Features

- Generate 10-, 20-, or 30-minute quests.
- Choose Nature, Mindfulness, or Exploration.
- Generate quests locally with Ollama and Qwen3.
- Track challenge progress and complete your quest.
- Handle generation errors gracefully.

## 🛠️ Tech Stack

- Python and FastAPI
- HTML, CSS, and JavaScript
- Ollama
- Qwen3 4B (quantized)

## 🚀 Run Locally

**Prerequisites:** Python, Git, and [Ollama](https://ollama.com/).

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd trailquest
```

Download the model:

```bash
ollama pull qwen3:4b-q4_K_M
```

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install dependencies and start the server:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Open **http://127.0.0.1:8000/app** in your browser.

Make sure Ollama is running locally. On Linux, you can start it with `ollama serve` if it isn't already running.

## 🔒 Local AI

Quest generation uses a model running through Ollama on your machine. No hosted AI API is required. Generation speed depends on your hardware.

## 🗺️ Roadmap

- Points for completed challenges
- Partial-completion rewards
- Quest completion celebrations

## 📄 License

No license has been specified yet. Add an open-source license if you want others to have explicit permission to reuse, modify, and distribute the project.
