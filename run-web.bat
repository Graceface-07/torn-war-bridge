@echo off
REM SIMPLE WEB DASHBOARD - Just Run This!

echo ========================================
echo   TORN WAR BRIDGE - WEB DASHBOARD
echo        Super Simple Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo X Node.js is not installed!
    echo   Please install from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js found: %NODE_VER%
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file with API keys...
    echo FF_SCOUTER_KEY=rwLgZTyqgWDxhoCx> .env
    echo TORN_API_KEY=CZP2D2ZnbXWsYiDT>> .env
    echo [OK] API keys configured!
) else (
    echo [OK] API keys already configured
)

echo.

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo [OK] Dependencies installed!
) else (
    echo [OK] Dependencies ready
)

echo.
echo ========================================
echo   STARTING WEB SERVER...
echo ========================================
echo.
echo [OK] Server starting on http://localhost:3000
echo.
echo Open your web browser and go to:
echo    http://localhost:3000
echo.
echo Then:
echo    1. Enter your User ID
echo    2. Enter enemy Faction ID
echo    3. Click 'Start Scan'
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the web server
node server.js
