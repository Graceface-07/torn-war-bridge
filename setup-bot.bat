@echo off
REM Super Simple Setup Script for Windows - Just Run This!

echo ========================================
echo   TORN WAR BRIDGE - DISCORD BOT
echo        Easy Setup Script
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

REM Check if .env exists
if not exist .env (
    echo Creating .env file...
    
    set /p discord_token="Enter your Discord Bot Token: "
    
    REM Use default API keys
    echo DISCORD_TOKEN=%discord_token%> .env
    echo FF_SCOUTER_KEY=rwLgZTyqgWDxhoCx>> .env
    echo TORN_API_KEY=CZP2D2ZnbXWsYiDT>> .env
    
    echo [OK] .env file created!
) else (
    echo [OK] .env file exists
)

echo.

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo [OK] Dependencies installed!
) else (
    echo [OK] Dependencies already installed
)

echo.
echo ========================================
echo   STARTING DISCORD BOT...
echo ========================================
echo.
echo The bot will show you an invite link.
echo Click it to add the bot to your Discord server!
echo.
echo Then use these commands in Discord:
echo   /scan user_id:YOUR_ID faction_id:ENEMY_ID
echo   /war-analysis
echo.
echo Press Ctrl+C to stop the bot
echo ========================================
echo.

REM Start the bot
node discord-bot.js
