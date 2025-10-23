@echo off
echo ========================================
echo OMRChecker Web Application Setup
echo ========================================
echo.

echo [1/4] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install core dependencies
    pause
    exit /b 1
)

pip install -r api\requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install API dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing Frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Setup complete!
echo.
echo ========================================
echo To start the application:
echo ========================================
echo 1. Start the backend API:
echo    python api\server.py
echo.
echo 2. In a new terminal, start the frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open http://localhost:3000 in your browser
echo ========================================
echo.
pause
