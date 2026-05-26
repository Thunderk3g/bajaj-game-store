@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

REM Check for npm installation
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ^^! npm is not installed or not in PATH
    set /p response="Would you like to install Node.js? (y/n): "
    if /i not "!response!"=="y" (
        echo npm is required to build this game.
        pause
        exit /b 1
    )

    REM Try Chocolatey
    where choco >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo Installing Node.js via Chocolatey...
        call choco install nodejs -y
        where npm >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            echo ^! Node.js installed successfully!
            goto npm_ok
        )
    )

    REM Try Scoop
    where scoop >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo Installing Node.js via Scoop...
        call scoop install nodejs
        where npm >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            echo ^! Node.js installed successfully!
            goto npm_ok
        )
    )

    echo.
    echo X Could not automatically install Node.js
    echo Please download and install from: https://nodejs.org/
    pause
    exit /b 1
)

:npm_ok
REM Check for Python installation
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    where python3 >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ^^! Python is not installed or not in PATH
        set /p response="Would you like to install Python 3? (y/n): "
        if /i not "!response!"=="y" (
            echo Python is required to serve this game.
            pause
            exit /b 1
        )

        REM Try Chocolatey
        where choco >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo Installing Python via Chocolatey...
            call choco install python -y
            where python >nul 2>nul
            if %ERRORLEVEL% EQU 0 (
                echo ^! Python installed successfully!
                goto python_ok
            )
        )

        REM Try Scoop
        where scoop >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo Installing Python via Scoop...
            call scoop install python
            where python >nul 2>nul
            if %ERRORLEVEL% EQU 0 (
                echo ^! Python installed successfully!
                goto python_ok
            )
        )

        echo.
        echo X Could not automatically install Python
        echo Please download and install from: https://www.python.org/
        pause
        exit /b 1
    )
)

:python_ok
echo.
echo Installing dependencies...
call npm install
echo.
echo Building Guardian Strike...
call npm run build
cd dist
start http://localhost:8012
python -m http.server 8012
pause
