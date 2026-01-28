@echo off
REM Torn War Bridge - Quick Start Script for Windows

echo 🎯 Starting Torn War Bridge...
echo.

REM Check if .env exists, if not create it
if not exist .env (
    echo 📝 Creating .env file...
    if exist .env.example (
        copy .env.example .env >nul
        REM Note: Windows doesn't have sed, so we create from scratch
        echo FF_SCOUTER_KEY=rwLgZTyqgWDxhoCx > .env
        echo TORN_API_KEY=CZP2D2ZnbXWsYiDT >> .env
        echo WORKER_URL=https://torn-war-bridge.tmecf.workers.dev/ >> .env
        echo ✅ .env file created with API keys
    ) else (
        echo ⚠️  Warning: .env.example not found, creating basic .env
        echo FF_SCOUTER_KEY=rwLgZTyqgWDxhoCx > .env
        echo TORN_API_KEY=CZP2D2ZnbXWsYiDT >> .env
        echo WORKER_URL=https://torn-war-bridge.tmecf.workers.dev/ >> .env
        echo ✅ .env file created
    )
    echo.
) else (
    echo ✅ .env file already exists
    echo.
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

echo 🚀 Starting server...
echo    Open http://localhost:3000 in your browser
echo    Press Ctrl+C to stop
echo.

REM Start the server
node server.js
