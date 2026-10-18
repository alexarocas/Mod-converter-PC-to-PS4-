param([string[]]$Categories=@('parts','sfx','aux','spanish'))
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'decode-model-original.ps1') -LoadOnly
$assetRoot=Join-Path $PSScriptRoot 'asset-conversion'
$header=[IO.File]::ReadAllBytes((Join-Path $PSScriptRoot 'model-conversion/ps4-original/wp_a_0550.partsbnd.dcx'))
$header[48]=7
$records=@();$cache=@{}
foreach($category in $Categories){
 $manifest=Join-Path $assetRoot ($category+'-conversion.json')
 if(-not (Test-Path -LiteralPath $manifest)){continue}
 foreach($item in (Get-Content -Raw $manifest | ConvertFrom-Json)){
  if($item.status -notlike 'prepared*'){continue}
  $source=[IO.Path]::GetFullPath($item.rawFilename)
  if((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLower() -ne $item.rawSHA256){throw 'Raw source changed'}
  $destination=Join-Path $assetRoot ('packed/'+$item.path)
  [IO.Directory]::CreateDirectory((Split-Path $destination -Parent)) | Out-Null
  if($cache.ContainsKey($item.rawSHA256)){
   [IO.File]::Copy($cache[$item.rawSHA256].filename,$destination,$true)
   $hash=$cache[$item.rawSHA256].sha256;$size=$cache[$item.rawSHA256].bytes
  }else{
   $raw=[IO.File]::ReadAllBytes($source)
   $packed=[Codec015]::Encode($raw,$header)
   $decoded=[Codec015]::Decode($packed)
   $provider=[Security.Cryptography.SHA256]::Create()
   $check=[BitConverter]::ToString($provider.ComputeHash($decoded)).Replace('-','').ToLower()
   if($decoded.Length -ne $raw.Length -or $check -ne $item.rawSHA256){throw 'Compression roundtrip failed'}
   [IO.File]::WriteAllBytes($destination,$packed)
   $hash=[BitConverter]::ToString($provider.ComputeHash($packed)).Replace('-','').ToLower();$size=$packed.Length
   $cache[$item.rawSHA256]=@{filename=$destination;sha256=$hash;bytes=$size}
   $raw=$null;$decoded=$null;$packed=$null;$provider.Dispose();[GC]::Collect()
  }
  $records+= [ordered]@{path=$item.path;filename=$destination;bytes=$size;sha256=$hash;rawSHA256=$item.rawSHA256;status=$item.status;codec='KRAK';level=7;decompressionEqual=$true;consoleTested=$false}
  $records | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $assetRoot 'compression-report.json') -Encoding utf8
  Write-Output ($item.path+': '+$size+' bytes, '+$item.status)
 }
}
