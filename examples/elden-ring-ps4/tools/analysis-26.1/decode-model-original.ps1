param([ValidateSet('decode','encode')][string]$Mode='decode',[string]$InputName='wp_a_0550.partsbnd.dcx',[string]$OutputName='wp_a_0550.bnd',[switch]$LoadOnly)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$dll=Join-Path $root 'analysis-26.0/task-006/src/Smithbox/Smithbox.Release/Output/oo2core_9_win64.dll'
if((Get-FileHash -LiteralPath $dll -Algorithm SHA256).Hash.ToLower() -ne '01301592c8e51660bfdd8785ed1ad762fd103033c85414c925fc3dd4b8b6e999'){throw 'DLL hash mismatch; STOP'}
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Codec015 {
[DllImport(@"$dll",CallingConvention=CallingConvention.Cdecl)] public static extern long OodleLZ_Decompress(byte[] s,long sl,byte[] d,long dl,int f,int c,int v,IntPtr db,long ds,IntPtr cb,IntPtr u,IntPtr sc,long ss,int phase);
[DllImport(@"$dll",CallingConvention=CallingConvention.Cdecl)] public static extern long OodleLZ_Compress(int codec,byte[] s,long sl,byte[] d,int level,IntPtr opts,IntPtr dict,IntPtr lrm,IntPtr scratch,long scratchSize);
[DllImport(@"$dll",CallingConvention=CallingConvention.Cdecl)] public static extern IntPtr OodleLZ_CompressOptions_GetDefault(int codec,int level);
[DllImport(@"$dll",CallingConvention=CallingConvention.Cdecl)] public static extern long OodleLZ_GetCompressedBufferSizeNeeded(int codec,long size);
public static byte[] Decode(byte[] b){int n=(b[28]<<24)|(b[29]<<16)|(b[30]<<8)|b[31];int cn=(b[32]<<24)|(b[33]<<16)|(b[34]<<8)|b[35];if(b.Length<76+cn || b.Length>76+cn+15)throw new Exception("DCX length");for(int i=76+cn;i<b.Length;i++)if(b[i]!=0)throw new Exception("Nonzero DCX padding");byte[] s=new byte[cn];Buffer.BlockCopy(b,76,s,0,cn);byte[] d=new byte[n+64];long got=OodleLZ_Decompress(s,cn,d,n,1,0,0,IntPtr.Zero,0,IntPtr.Zero,IntPtr.Zero,IntPtr.Zero,0,3);if(got!=n)throw new Exception("decode length");Array.Resize(ref d,n);return d;}
public static byte[] Encode(byte[] b,byte[] header){int level=header[48];IntPtr defaults=OodleLZ_CompressOptions_GetDefault(8,level);IntPtr opts=Marshal.AllocHGlobal(256);try{byte[] copy=new byte[256];Marshal.Copy(defaults,copy,0,256);Marshal.Copy(copy,0,opts,256);Marshal.WriteInt32(opts,8,1);Marshal.WriteInt32(opts,12,0x40000);byte[] c=new byte[OodleLZ_GetCompressedBufferSizeNeeded(8,b.Length)];long n=OodleLZ_Compress(8,b,b.Length,c,level,opts,IntPtr.Zero,IntPtr.Zero,IntPtr.Zero,0);if(n<=0||n>c.Length)throw new Exception("compress length");byte[] d=new byte[76+n];Buffer.BlockCopy(header,0,d,0,76);for(int i=0;i<4;i++){d[28+i]=(byte)(b.Length>>(24-8*i));d[32+i]=(byte)(n>>(24-8*i));}Buffer.BlockCopy(c,0,d,76,(int)n);return d;}finally{Marshal.FreeHGlobal(opts);}}
}
"@
if($LoadOnly){return}
if($Mode -eq 'encode') {
  $modelDir=Join-Path $PSScriptRoot 'model-conversion/experimental'
  $reference=[IO.File]::ReadAllBytes((Join-Path $PSScriptRoot 'model-conversion/ps4-original/wp_a_0550.partsbnd.dcx'))
  $reference[48]=7
  $raw=[IO.File]::ReadAllBytes((Join-Path $modelDir 'wp_a_9925.bnd'))
  $result=[Codec015]::Encode($raw,$reference)
  $check=[Codec015]::Decode($result)
  $hashProvider=[Security.Cryptography.SHA256]::Create()
  $rawHash=[BitConverter]::ToString($hashProvider.ComputeHash($raw)).Replace('-','').ToLower()
  $checkHash=[BitConverter]::ToString($hashProvider.ComputeHash($check)).Replace('-','').ToLower()
  if($check.Length -ne $raw.Length -or $checkHash -ne $rawHash){throw 'Compression roundtrip failed'}
  foreach($modelName in @('wp_a_9925.partsbnd.dcx','wp_a_9925_l.partsbnd.dcx')){[IO.File]::WriteAllBytes((Join-Path $modelDir $modelName),$result)}
  $report=[ordered]@{experimental=$true;consoleTested=$false;codec='KRAK';level=7;bytes=$result.Length;sha256=[BitConverter]::ToString($hashProvider.ComputeHash($result)).Replace('-','').ToLower();rawSHA256=$rawHash;decompressionEqual=$true}
  $report | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $modelDir 'weapon-compression-report.json') -Encoding utf8
  $report | ConvertTo-Json
  exit
}
$packed=[IO.File]::ReadAllBytes((Join-Path $PSScriptRoot ('model-conversion/ps4-original/'+$InputName)))
$decoded=[Codec015]::Decode($packed)
[IO.File]::WriteAllBytes((Join-Path $PSScriptRoot ('model-conversion/ps4-original/'+$OutputName)),$decoded)
