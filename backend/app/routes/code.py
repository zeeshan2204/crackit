import asyncio
import subprocess
import tempfile
import os
import sys

from fastapi import APIRouter
from app.models.schemas import CodeRunRequest, CodeRunResponse

router = APIRouter(prefix="/code", tags=["code"])

TIMEOUT = 10  # seconds per run


def _execute(language: str, code: str, stdin_data: str):
    with tempfile.TemporaryDirectory() as tmpdir:
        try:
            if language == "python":
                src = os.path.join(tmpdir, "main.py")
                with open(src, "w", encoding="utf-8") as f:
                    f.write(code)
                r = subprocess.run(
                    [sys.executable, src],
                    input=stdin_data, capture_output=True, text=True, timeout=TIMEOUT,
                )
                return r.stdout, r.stderr, r.returncode

            elif language == "java":
                src = os.path.join(tmpdir, "Main.java")
                with open(src, "w", encoding="utf-8") as f:
                    f.write(code)
                comp = subprocess.run(["javac", src], capture_output=True, text=True, timeout=30)
                if comp.returncode != 0:
                    return "", comp.stderr, comp.returncode
                r = subprocess.run(
                    ["java", "-cp", tmpdir, "Main"],
                    input=stdin_data, capture_output=True, text=True, timeout=TIMEOUT,
                )
                return r.stdout, r.stderr, r.returncode

            elif language == "c":
                src = os.path.join(tmpdir, "main.c")
                exe = os.path.join(tmpdir, "main.exe" if sys.platform == "win32" else "main")
                with open(src, "w", encoding="utf-8") as f:
                    f.write(code)
                comp = subprocess.run(["gcc", src, "-o", exe], capture_output=True, text=True, timeout=30)
                if comp.returncode != 0:
                    return "", comp.stderr, comp.returncode
                r = subprocess.run([exe], input=stdin_data, capture_output=True, text=True, timeout=TIMEOUT)
                return r.stdout, r.stderr, r.returncode

            elif language == "cpp":
                src = os.path.join(tmpdir, "main.cpp")
                exe = os.path.join(tmpdir, "main.exe" if sys.platform == "win32" else "main")
                with open(src, "w", encoding="utf-8") as f:
                    f.write(code)
                comp = subprocess.run(
                    ["g++", src, "-o", exe, "-std=c++17"],
                    capture_output=True, text=True, timeout=30,
                )
                if comp.returncode != 0:
                    return "", comp.stderr, comp.returncode
                r = subprocess.run([exe], input=stdin_data, capture_output=True, text=True, timeout=TIMEOUT)
                return r.stdout, r.stderr, r.returncode

            else:
                return "", f"Unsupported language: {language}", 1

        except subprocess.TimeoutExpired:
            return "", "Time limit exceeded (10s)", 1
        except FileNotFoundError as e:
            return "", f"Compiler not found: {e.filename}", 1


@router.post("/run", response_model=CodeRunResponse)
async def run_code(body: CodeRunRequest):
    loop = asyncio.get_event_loop()
    stdout, stderr, exit_code = await loop.run_in_executor(
        None, _execute, body.language, body.code, body.stdin
    )
    return CodeRunResponse(stdout=stdout, stderr=stderr, exit_code=exit_code)
