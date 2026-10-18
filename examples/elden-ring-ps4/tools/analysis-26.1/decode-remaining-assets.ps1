$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'decode-model-original.ps1') -LoadOnly
$inventory=Get-Content -Raw (Join-Path $PSScriptRoot 'mod-inventory.json') | ConvertFrom-Json
$seen=@{}
foreach($item in $inventory.files){
 if($item.path -notmatch '^(parts|sfx|menu|msg)/' -and $item.path -notmatch '\.chrbnd\.dcx$'){continue}
 if($seen.ContainsKey($item.sha256)){continue};$seen[$item.sha256]=$true
 $source=Join-Path $PSScriptRoot ('inputs/'+$item.path)
 if((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLower() -ne $item.sha256){throw 'Source hash mismatch'}
 $bytes=[IO.File]::ReadAllBytes($source)
 if([Text.Encoding]::ASCII.GetString($bytes,40,4) -ne 'KRAK'){continue}
 $dir=Join-Path $PSScriptRoot ('asset-conversion/sources/'+$item.sha256)
 [IO.Directory]::CreateDirectory($dir) | Out-Null
 $raw=[Codec015]::Decode($bytes)
 [IO.File]::WriteAllBytes((Join-Path $dir 'container.bin'),$raw)
 Write-Output ($item.path+': '+$raw.Length+' decoded bytes')
}
