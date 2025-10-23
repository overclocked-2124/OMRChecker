@echo off
echo Starting OMRChecker Backend API...
echo.
echo The API will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
set PYTHONPATH=%~dp0
python api\server.py
