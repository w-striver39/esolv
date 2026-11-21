# Robust Automated Project Backup Script for Esolv
$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$BackupsDir = Join-Path $ProjectRoot "backups"

if (-not (Test-Path $BackupsDir)) {
    New-Item -ItemType Directory -Force -Path $BackupsDir | Out-Null
}

$Timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$BackupFileName = "backup_esolv_$Timestamp.zip"
$BackupFilePath = Join-Path $BackupsDir $BackupFileName

Write-Host "Creating backup in: $BackupFilePath..." -ForegroundColor Cyan

# Files and folders to exclude from backup
$ExcludeList = @("backups", ".git", "node_modules")

$TempDir = Join-Path $env:TEMP "esolv_bk_$Timestamp"
if (Test-Path $TempDir) { Remove-Item -Path $TempDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

Get-ChildItem -Path $ProjectRoot | Where-Object { $ExcludeList -notcontains $_.Name } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $TempDir -Recurse -Force
}

# Create zip using .NET ZipFile (fast, zero console output dependencies)
[System.IO.Compression.ZipFile]::CreateFromDirectory($TempDir, $BackupFilePath)

# Clean up temporary directory
Remove-Item -Path $TempDir -Recurse -Force

# Also create an uncompressed mirror snapshot folder for immediate browsing if desired
$SnapshotDir = Join-Path $BackupsDir "latest_snapshot"
if (Test-Path $SnapshotDir) { Remove-Item -Path $SnapshotDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $SnapshotDir | Out-Null
Get-ChildItem -Path $ProjectRoot | Where-Object { $ExcludeList -notcontains $_.Name } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $SnapshotDir -Recurse -Force
}

Write-Host "Backup successfully created: $BackupFileName" -ForegroundColor Green
Write-Host "Latest Snapshot updated: $SnapshotDir" -ForegroundColor Green
Write-Host "Location: $BackupFilePath" -ForegroundColor Yellow
