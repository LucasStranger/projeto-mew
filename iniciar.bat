@echo off
setlocal
cd /d "%~dp0"
if defined MEW_PYTHON (
  "%MEW_PYTHON%" -m backend.server %*
) else if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -m backend.server %*
) else (
  where py >nul 2>nul
  if errorlevel 1 (
    python -m backend.server %*
  ) else (
    py -3 -m backend.server %*
  )
)
if errorlevel 1 pause
