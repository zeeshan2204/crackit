import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama3-8b-8192"


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


def generate_exam_feedback(total_score: int, sections: list[dict], passed: bool) -> str:
    section_lines = "\n".join([
        f"  - {s.get('section','').capitalize()}: {s.get('correct',0)}/{s.get('total',0)} correct ({s.get('score',0)}%)"
        for s in sections
    ])
    status = "PASSED" if passed else "did NOT clear the cutoff"
    prompt = (
        f"You are an expert campus placement coach. A student just completed their InterviewAI placement test.\n\n"
        f"Result: {status} | Overall Score: {total_score}%\n"
        f"Section Scores:\n{section_lines}\n\n"
        f"Write a personalized, motivating feedback report with these exact sections:\n"
        f"1. **Overall Assessment** (2 sentences — honest but encouraging)\n"
        f"2. **Your Strengths** (2 bullet points based on highest-scoring sections)\n"
        f"3. **Focus Areas** (2-3 bullet points — specific tips for lowest-scoring sections)\n"
        f"4. **7-Day Study Plan** (one action per day, practical and specific)\n\n"
        f"Be concise, specific, and actionable. Use the actual section names."
    )
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=700,
    )
    return response.choices[0].message.content.strip()


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