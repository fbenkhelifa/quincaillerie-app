<#
Script: scripts/setup-local.ps1
Purpose: Bootstrap a developer's local environment quickly using SQLite so the app can be run without extra services.

Usage:
  .\scripts\setup-local.ps1            # copy .env.local.example -> .env, create sqlite DB, install deps
  .\scripts\setup-local.ps1 -MoveBackupOut  # move .env.local.backup to your user profile for safekeeping
  .\scripts\setup-local.ps1 -NoDeps    # do not run composer/npm install
#>

param(
    [switch]$MoveBackupOut,
    [switch]$NoDeps
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

Write-Host "Setting up local environment for Quincaillerie..."

if (Test-Path ".env") {
    Write-Host "Found existing .env — leaving it in place."
} else {
    if (Test-Path ".env.local.example") {
        Copy-Item ".env.local.example" ".env" -Force
        Write-Host "Copied .env.local.example -> .env"
    } elseif (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "Copied .env.example -> .env (no .env.local.example found)"
    } else {
        Write-Host "No .env.example found. Please create one and re-run."
        exit 1
    }
}

# Ensure APP_KEY exists
$envText = Get-Content -Raw .env
if ($envText -notmatch 'APP_KEY=') {
    Write-Host "Generating APP_KEY..."
    php artisan key:generate --ansi
} else {
    Write-Host "APP_KEY already set (or present as empty key)."
}

# Ensure SQLite DB if DB_CONNECTION=sqlite
if (Get-Content .env | Select-String -SimpleMatch 'DB_CONNECTION=sqlite') {
    $dbPath = Join-Path $root 'database' 'database.sqlite'
    if (!(Test-Path $dbPath)) {
        if (!(Test-Path (Join-Path $root 'database'))) { New-Item -ItemType Directory -Path (Join-Path $root 'database') | Out-Null }
        New-Item -Path $dbPath -ItemType File -Force | Out-Null
        Write-Host "Created SQLite database file: $dbPath"
    } else {
        Write-Host "SQLite database file exists: $dbPath"
    }
}

# Move .env backup out of project root if requested
$backup = Join-Path $root '.env.local.backup'
if (Test-Path $backup) {
    if ($MoveBackupOut) {
        $destDir = Join-Path $env:USERPROFILE 'quincaillerie-app-env-backups'
        if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
        $timestamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
        $dest = Join-Path $destDir ("env-backup-$timestamp.backup")
        Move-Item -Path $backup -Destination $dest -Force
        Write-Host "Moved $backup -> $dest"
    } else {
        Write-Host "Found .env.local.backup in project root. Run this script with -MoveBackupOut to move it to your user profile for safekeeping."
    }
}

if (-not $NoDeps) {
    if (Test-Path 'composer.json') {
        Write-Host "Installing PHP dependencies (composer)..."
        composer install --no-interaction --prefer-dist --no-progress --no-suggest
    }
    if (Test-Path 'package.json') {
        Write-Host "Installing Node dependencies (npm)..."
        npm ci --no-audit --progress=false
    }
}

Write-Host "Bootstrap finished. Run 'php artisan serve' and visit http://localhost:8000 (or follow README)."
