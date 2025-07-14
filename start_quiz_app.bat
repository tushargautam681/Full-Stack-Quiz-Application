@echo off
echo Starting Quiz Application Server...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python found. Starting server...
    python serve.py
) else (
    echo Python not found. Checking for Python3...
    python3 --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Python3 found. Starting server...
        python3 serve.py
    ) else (
        echo Python not found. Please install Python or use another method to serve the application.
        echo See README.md for alternative methods.
        pause
        exit /b 1
    )
)

pause