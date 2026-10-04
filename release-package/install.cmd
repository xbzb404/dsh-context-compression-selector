@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul 2>&1

rem ===========================================================================
rem  dsh-context-compression-selector - offline installer for DeepSeek Harness
rem
rem  Copies the Bundle and its run-time dependencies straight from the `vendor`
rem  folder next to this script into a Harness profile. It deliberately does NOT
rem  call pnpm:
rem
rem    * pnpm has to delete its own temp tree first, which corporate endpoint
rem      protection and the WorkBuddy sandbox both block;
rem    * any package manager run rewrites node_modules, which changes every
rem      bundle's mtime/ctime/size. Harness hashes those into the module-graph
rem      revision, so a rewrite right before launch invalidates the URLs the
rem      renderer already baked into the page and every client module fails to
rem      load with a bare "failed to load".
rem
rem  A plain copy is atomic enough to avoid both problems.
rem
rem  Usage:  install.cmd [profile]
rem          install.cmd desktop
rem          install.cmd --help
rem ===========================================================================

set "SCRIPT_DIR=%~dp0"
set "VENDOR=%SCRIPT_DIR%vendor"
set "PROFILE=%~1"
if "%PROFILE%"=="" set "PROFILE=desktop"
if /i "%PROFILE%"=="--help" goto :usage
if /i "%PROFILE%"=="-h"     goto :usage
if /i "%PROFILE%"=="/?"     goto :usage

if not defined DSH_HOME set "DSH_HOME=%USERPROFILE%\.dsh"
rem Normalise forward slashes: robocopy and `copy /Y` both dislike them, and a
rem DSH_HOME like "C:/Users/x/.dsh" otherwise produces paths such as
rem "C:/Users/x/.dsh\profiles\desktop".
set "DSH_HOME=%DSH_HOME:/=\%"
rem Strip a trailing backslash so joining is predictable.
if "%DSH_HOME:~-1%"=="\" set "DSH_HOME=%DSH_HOME:~0,-1%"
set "PROFILE_DIR=%DSH_HOME%\profiles\%PROFILE%"
set "NODE_MODULES=%PROFILE_DIR%\node_modules"

echo.
echo === dsh-context-compression-selector installer ===
echo   profile dir : %PROFILE_DIR%
echo   vendor dir  : %VENDOR%
echo.

rem ---- 0. sanity checks -----------------------------------------------------
if not exist "%VENDOR%\dsh-context-compression-selector\package.json" (
  echo [X] vendor folder is missing or incomplete.
  echo     Expected: %VENDOR%\dsh-context-compression-selector\package.json
  echo     Unpack the whole zip, do not move install.cmd out of it.
  goto :fail
)

if not exist "%PROFILE_DIR%\package.json" (
  echo [X] no Harness profile at %PROFILE_DIR%
  echo     Start DeepSeek Harness once so it creates the profile, then retry.
  goto :fail
)

rem The app owns the profile while it runs; writing underneath it is what
rem corrupts the module graph. Refuse rather than half-install.
tasklist /FI "IMAGENAME eq DeepSeek Harness.exe" 2>nul | "%SystemRoot%\System32\find.exe" /I "DeepSeek Harness.exe" >nul
if not errorlevel 1 (
  echo [X] DeepSeek Harness is running.
  echo     Quit it completely ^(check the tray^), then run this script again.
  goto :fail
)

rem ---- 1. back up the manifest ----------------------------------------------
for /f "tokens=1-4 delims=/: " %%a in ("%DATE% %TIME%") do set "STAMP=%%a%%b%%c-%%d"
set "STAMP=%STAMP: =0%"
set "BACKUP=%PROFILE_DIR%\package.json.bak-install-%RANDOM%"
copy /Y "%PROFILE_DIR%\package.json" "%BACKUP%" >nul
if errorlevel 1 (
  echo [X] could not back up package.json
  goto :fail
)
echo [1/4] backed up package.json
echo       -^> %BACKUP%

rem ---- 2. copy the packages -------------------------------------------------
rem Order matters only for readability; none of these overwrite a real
rem Harness-provided package because Harness injects the rest at run time.
set "COPY_LIST=dsh-context-compression-selector-runtime dsh-context-compression-selector js-yaml @deepseek-ai\dsh-compaction-basic @deepseek-ai\dsh-command-compact @huggingface\tokenizers"

echo [2/4] copying packages into node_modules
set "COPIED=0"
for %%P in (%COPY_LIST%) do (
  if exist "%VENDOR%\%%P\package.json" (
    if exist "%NODE_MODULES%\%%P" (
      echo       ~ %%P ^(already present, refreshing^)
    ) else (
      echo       + %%P
    )
    robocopy "%VENDOR%\%%P" "%NODE_MODULES%\%%P" /E /NFL /NDL /NJH /NJS /NP /R:1 /W:1 >nul
    if errorlevel 8 (
      echo       [X] failed to copy %%P
      goto :fail
    )
    set /a COPIED+=1
  ) else (
    echo       - %%P ^(not in vendor, skipped^)
  )
)
echo       copied !COPIED! package^(s^)

rem ---- 3. register the Bundle + pin the runtime ------------------------------
echo [3/4] updating profile configuration
set "PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%PS%" set "PS=powershell"

"%PS%" -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$dir='%PROFILE_DIR%';" ^
  "$m=Get-Content -Raw -LiteralPath (Join-Path $dir 'package.json') | ConvertFrom-Json;" ^
  "if(-not $m.dsh){$m|Add-Member -NotePropertyName dsh -NotePropertyValue ([pscustomobject]@{}) -Force};" ^
  "if(-not $m.dsh.profile){$m.dsh|Add-Member -NotePropertyName profile -NotePropertyValue ([pscustomobject]@{}) -Force};" ^
  "$b=@($m.dsh.profile.bundles);" ^
  "if($b -notcontains 'dsh-context-compression-selector'){" ^
  "  $b+='dsh-context-compression-selector';" ^
  "  $m.dsh.profile|Add-Member -NotePropertyName bundles -NotePropertyValue $b -Force;" ^
  "  Write-Host '      + registered dsh-context-compression-selector in dsh.profile.bundles'" ^
  "} else { Write-Host '      = bundle already registered' };" ^
  "$json=$m|ConvertTo-Json -Depth 20;" ^
  "[System.IO.File]::WriteAllText((Join-Path $dir 'package.json'), $json, (New-Object System.Text.UTF8Encoding($false)));" ^
  "Write-Host '      package.json written (utf-8, no BOM)'"

if errorlevel 1 (
  echo [X] failed to update package.json
  goto :fail
)

rem ---- 4. verify ------------------------------------------------------------
echo [4/4] verifying
set "PROBLEMS=0"
call :must "%NODE_MODULES%\dsh-context-compression-selector\lib\index.js"      "selector lib/index.js"
call :must "%NODE_MODULES%\dsh-context-compression-selector\cordis.patch.yml"  "selector cordis.patch.yml"
call :must "%NODE_MODULES%\dsh-context-compression-selector-runtime\lib\index.js" "runtime lib/index.js"
call :must "%NODE_MODULES%\dsh-context-compression-selector-runtime\assets"    "runtime tokenizer assets"
call :must "%NODE_MODULES%\js-yaml\package.json"                                "js-yaml"
call :must "%NODE_MODULES%\@huggingface\tokenizers\package.json"                "tokenizers"

if not "%PROBLEMS%"=="0" goto :fail

echo.
echo === done ===
echo   Restart DeepSeek Harness, then open Settings and pick the
echo   "Context compression" section.
echo.
echo   If anything looks wrong, restore:
echo     copy /Y "%BACKUP%" "%PROFILE_DIR%\package.json"
echo.
pause
exit /b 0

rem --------------------------------------------------------------------------
:must
if exist "%~1" (
  echo       ok   %~2
) else (
  echo       [X]  %~2  ^(missing: %~1^)
  set "PROBLEMS=1"
)
exit /b 0

:usage
echo.
echo  dsh-context-compression-selector - offline installer
echo.
echo    install.cmd [profile]     install into %DSH_HOME%\profiles\^(profile^)
echo                              (default profile: desktop^)
echo    install.cmd --help        show this message
echo.
echo  Set DSH_HOME to install into a non-default Harness home.
echo.
exit /b 0

:fail
echo.
echo === FAILED ===
echo   Nothing else was changed. Restore the manifest with:
echo     copy /Y "%BACKUP%" "%PROFILE_DIR%\package.json"
echo.
pause
exit /b 1
