# Windows Troubleshooting Script
# Save this as setup_backend.bat in the backend folder

@echo off
echo ====================================
echo Data Mapper Agent - Backend Setup
echo ====================================
echo.

echo Step 1: Removing old virtual environment...
if exist venv (
    rmdir /s /q venv
    echo Old venv removed.
) else (
    echo No old venv found.
)
echo.

echo Step 2: Creating fresh virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    echo Make sure Python is installed and in your PATH
    pause
    exit /b 1
)
echo Virtual environment created successfully.
echo.

echo Step 3: Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo Step 4: Upgrading pip...
python -m pip install --upgrade pip
echo.

echo Step 5: Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 6: Verifying installation...
pip list
echo.

echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo To start the server, run:
echo   venv\Scripts\activate
echo   python -m uvicorn app.main:app --reload
echo.
pause
