$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$inventory=Get-Content -Raw (Join-Path $PSScriptRoot 'mod-inventory.json') | ConvertFrom-Json
$inputRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'inputs'))
$archive=[IO.Compression.ZipFile]::OpenRead((Join-Path (Split-Path $PSScriptRoot -Parent) $inventory.source))
try {
 foreach($item in $inventory.files){
  $destination=[IO.Path]::GetFullPath((Join-Path $inputRoot $item.path))
  if(-not $destination.StartsWith($inputRoot+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'Path outside inputs'}
  $entry=$archive.GetEntry($item.path)
  if($null -eq $entry -or $entry.Length -ne $item.length){throw "ZIP metadata mismatch: $($item.path)"}
  if(-not (Test-Path -LiteralPath $destination)){
   [IO.Directory]::CreateDirectory((Split-Path $destination -Parent)) | Out-Null
   [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,$destination,$false)
  }
  if((Get-Item -LiteralPath $destination).Length -ne $item.length -or (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLower() -ne $item.sha256){throw "Source hash mismatch: $($item.path)"}
 }
 Write-Output "Verified $($inventory.files.Count) files from the 26.1 ZIP."
} finally {$archive.Dispose()}
