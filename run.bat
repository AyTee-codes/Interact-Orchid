@echo off
echo ===================================================
echo   Interact Nepal Web Portal Local Launcher
echo ===================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python detected. Starting local server...
    echo.
    echo Open your browser at: http://localhost:8000
    echo.
    start http://localhost:8000
    python -m http.server 8000
    goto end
)

where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js / npx detected. Starting http-server...
    echo.
    echo Open your browser at: http://localhost:8000
    echo.
    start http://localhost:8000
    npx -y http-server -p 8000
    goto end
)

echo [WARNING] Neither Python nor Node.js/npx was detected in your system PATH.
echo.
echo Please do one of the following:
echo   1. Install Python (https://python.org) or Node.js (https://nodejs.org).
echo   2. Use an IDE web server extension (like Live Server in VS Code).
echo   3. Run a server program of your choice in this directory.
echo.
pause

:end
