import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama3-70b-8192"


def evaluate_code(code: str, language: str, problem: dict) -> dict:
    prompt = (
        "You are a senior software engineer and technical interviewer.\n\n"
        "Problem: \"" + problem['title'] + "\" (" + problem['difficulty'] + ", topic: " + problem['topic'] + ")\n"
        "Description: " + problem['description'] + "\n\n"
        "Candidate's code (" + language + "):\n" + code + "\n\n"
        "Return ONLY valid JSON, no markdown:\n"
        "{\n"
        "  \"scores\": {\n"
        "    \"correctness\": 85,\n"
        "    \"efficiency\": 80,\n"
        "    \"readability\": 90,\n"
        "    \"edge_cases\": 70\n"
        "  },\n"
        "  \"overall\": 82,\n"
        "  \"summary\": \"write summary here\",\n"
        "  \"strengths\": [\"strength1\", \"strength2\"],\n"
        "  \"improvements\": [\"improvement1\", \"improvement2\"],\n"
        "  \"ai_comment\": \"write comment here\"\n"
        "}"
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1000
    )

    raw = response.choices[0].message.content.strip()
    return json.loads(raw)


def chat_with_ai(messages: list[dict], context: str) -> str:
    system_prompt = (
        "You are a friendly, expert technical interviewer. "
        "Context: " + context + " "
        "Be concise (2-3 sentences), encouraging but honest."
    )

    all_messages = [{"role": "system", "content": system_prompt}] + messages

    response = client.chat.completions.create(
        model=MODEL,
        messages=all_messages,
        temperature=0.7,
        max_tokens=300
    )

    return response.choices[0].message.content.strip()