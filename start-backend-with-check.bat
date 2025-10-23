@echo off
echo ========================================
echo Starting OMRChecker Backend API
echo ========================================
echo.
echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)
echo.

echo Checking required packages...
python -c "import cv2, numpy, fastapi, uvicorn" 2>nul
if errorlevel 1 (
    echo WARNING: Some packages may be missing. Installing...
    pip install opencv-python numpy fastapi uvicorn python-multipart email-validator
)
echo.

echo Starting FastAPI server...
echo.
echo ========================================
echo API will be available at: http://localhost:8000
echo API Documentation at: http://localhost:8000/docs
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Set PYTHONPATH to include the project root directory
set PYTHONPATH=%CD%
cd api
python server.py
