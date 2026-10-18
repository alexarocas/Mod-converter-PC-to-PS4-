param([ValidateSet('decode','encode')][string]$Mode='decode')
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
$baseDir=Join-Path $PSScriptRoot 'animation-conversion/experimental'
$reports=@()
$packedDir=Join-Path $baseDir 'packed'
New-Item -ItemType Directory -Force -Path $packedDir | Out-Null
foreach ($animationName in @('c0000.anibnd.dcx','c0000_a00_hi.anibnd.dcx','c0000_a6x.anibnd.dcx')) {
$header=[IO.File]::ReadAllBytes((Join-Path $PSScriptRoot ('ps4-1.17.1/chr/'+$animationName)))
$header[48]=7
$raw=[IO.File]::ReadAllBytes((Join-Path $baseDir ($animationName+'.bnd')))
$packed=[Codec015]::Encode($raw,$header)
$decoded=[Codec015]::Decode($packed)
$hashAlgorithm=[Security.Cryptography.SHA256]::Create()
try {
$rawHash=[BitConverter]::ToString($hashAlgorithm.ComputeHash($raw)).Replace('-','').ToLowerInvariant()
$decodedHash=[BitConverter]::ToString($hashAlgorithm.ComputeHash($decoded)).Replace('-','').ToLowerInvariant()
if ($raw.Length -ne $decoded.Length -or $rawHash -ne $decodedHash) { throw 'DCX roundtrip failed' }
$packedHash=[BitConverter]::ToString($hashAlgorithm.ComputeHash($packed)).Replace('-','').ToLowerInvariant()
} finally { $hashAlgorithm.Dispose() }
[IO.File]::WriteAllBytes((Join-Path $packedDir $animationName),$packed)
$record=[pscustomobject]@{name=$animationName;codec='KRAK';level=[int]$packed[48];packedLength=$packed.Length;rawLength=$raw.Length;sha256=$packedHash;rawSha256=$rawHash;decompressionVerified=$true;consoleTested=$false}
$reports+=$record
$record | ConvertTo-Json -Compress | Write-Output
}
$reports | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $baseDir 'compression-report.json') -Encoding utf8
