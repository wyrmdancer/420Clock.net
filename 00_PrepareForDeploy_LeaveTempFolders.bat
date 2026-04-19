@echo off
setlocal enabledelayedexpansion

REM === CONFIGURATION ===
set "SOURCE=%~dp0"
set "OUTPUTDIST=%~dp0dist"
set "OUTPUTROOT=%~dp0_DEPLOY_"

REM === DATE/TIME FORMATTING (safe for filenames) ===
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
    set "MM=%%a"
    set "DD=%%b"
    set "YYYY=%%c"
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set "HH=%%a"
    set "MN=%%b"
)
if "%time:~0,2%" lss "10" set "HH=0%time:~1,1%"
set "HH=%HH: =0%"
set "MN=%MN::=%"

set "ZIPNAME=_DEPLOY_.zip"

echo.
echo === Preparing Deployment Package ===

REM === CLEANUP OLD FILES ===
if exist "%OUTPUTDIST%" (
    echo Removing old _DIST_ folder...
    rd /s /q "%OUTPUTDIST%"
)
if exist "%OUTPUTROOT%" (
    echo Removing old _DEPLOY_ folder...
    rd /s /q "%OUTPUTROOT%"
)
if exist "%ZIPNAME%" (
    echo Removing old %ZIPNAME%...
    del "%ZIPNAME%"
)

REM === CREATE FOLDERS ===
echo Creating folders...
mkdir "%OUTPUTROOT%"
mkdir "%OUTPUTDIST%"


REM === COPY ROOT FILES TO DIST FOLDER ===
echo Copying root files...
for %%F in (*.html *.htm *.ico *.webmanifest *.png *.jpg *.jpeg *.gif *.svg *.json *.webm) do (
    if exist "%%F" copy "%%F" "%OUTPUTDIST%" >nul
)

REM === COPY RELEVANT DIRECTORIES TO DIST FOLDER ===
set "FOLDERS=css static img snd vid"
for %%D in (%FOLDERS%) do (
    if exist "%SOURCE%%%D" (
        echo Copying folder %%D to temp...
        xcopy "%SOURCE%%%D\*" "%OUTPUTDIST%\%%D\" /E /I /Y >nul
    )
)

REM Copy dist folder to output root
echo Copying dist folder to output root...
xcopy "%OUTPUTDIST%\*" "%OUTPUTROOT%\dist\" /E /I /Y >nul


REM === ZIP FOLDER ===
echo.
echo Creating ZIP archive: %ZIPNAME%
powershell -command "Compress-Archive -Path '%OUTPUTROOT%\*' -DestinationPath '%OUTPUTROOT%' -Force" >nul 2>&1

if exist "%ZIPNAME%" (
    echo ✅ Successfully created %ZIPNAME%
) else (
    echo ❌ Failed to create ZIP archive. Check PowerShell availability.
)

echo.
echo ✅ Done! Zipped Deployment Package created:
echo    %ZIPNAME%
echo	Uncompressed folder available at:
echo 	%OUTPUTROOT%
echo.
pause
exit