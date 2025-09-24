@echo off
echo Starting Play Finder V2 Server...
echo.
echo Your app will be available at:
echo http://localhost:8000
echo.
echo To access from your phone:
echo 1. Make sure your phone and computer are on the same WiFi
echo 2. Find your computer's IP address (run 'ipconfig' in Command Prompt)
echo 3. On your phone, go to: http://YOUR_IP_ADDRESS:8000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try to start Python server first
python -m http.server 8000 2>nul
if %errorlevel% neq 0 (
    echo Python not found, trying Node.js...
    npx serve . -p 8000 2>nul
    if %errorlevel% neq 0 (
        echo Neither Python nor Node.js found.
        echo Please install Python or Node.js, or use Option 1 (Netlify deployment)
        pause
    )
)
