@echo off
REM Diagnostic Script for Windows - Run this to check your setup

echo ========================================
echo    TORN WAR BRIDGE - DIAGNOSTIC TOOL
echo ========================================
echo.

echo 1. Checking Current Directory...
echo    You are in: %CD%
echo.

echo 2. Checking for required files...
if exist server.js (
    echo    ✅ server.js found
) else (
    echo    ❌ server.js NOT FOUND
    echo       → You are NOT in the torn-war-bridge folder!
    echo       → Run: cd torn-war-bridge
)

if exist package.json (
    echo    ✅ package.json found
) else (
    echo    ❌ package.json NOT FOUND
)

if exist public (
    echo    ✅ public\ folder found
) else (
    echo    ❌ public\ folder NOT FOUND
)

if exist public\index.html (
    echo    ✅ public\index.html found
) else (
    echo    ❌ public\index.html NOT FOUND
)

echo.
echo 3. Checking Node.js installation...
where node >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo    ✅ Node.js is installed: %NODE_VER%
) else (
    echo    ❌ Node.js NOT FOUND
    echo       → Install from: https://nodejs.org/
)

where npm >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
    echo    ✅ npm is installed: %NPM_VER%
) else (
    echo    ❌ npm NOT FOUND
    echo       → Install from: https://nodejs.org/
)

echo.
echo 4. Checking dependencies...
if exist node_modules (
    echo    ✅ node_modules folder exists
) else (
    echo    ⚠️  node_modules NOT FOUND
    echo       → Run: npm install
)

echo.
echo 5. Checking Git repository...
if exist .git (
    echo    ✅ This is a Git repository
) else (
    echo    ⚠️  Not a Git repository
    echo       → Did you clone the repo?
)

echo.
echo ========================================
echo    RECOMMENDED NEXT STEPS:
echo ========================================
echo.

if not exist server.js (
    echo ❌ PROBLEM: You are not in the torn-war-bridge folder
    echo.
    echo FIX:
    echo 1. Find where you cloned the repository
    echo 2. Run: cd torn-war-bridge
    echo 3. Run this diagnostic again
    echo.
) else if not exist node_modules (
    echo ⚠️  Dependencies not installed
    echo.
    echo FIX:
    echo    npm install
    echo.
) else (
    echo ✅ Everything looks good!
    echo.
    echo TO START THE SERVER:
    echo    node server.js
    echo.
    echo Then open: http://localhost:3000
    echo.
)

echo ========================================
pause
