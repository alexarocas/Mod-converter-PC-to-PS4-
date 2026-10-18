// Read-only subset inspector. Format references are recorded in the report.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const root = __dirname;
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function unwrap(b) {
  if (b.toString('ascii',0,4) !== 'DCX\0') return {bytes:b,codec:null};
  const dcp=b.indexOf(Buffer.from('DCP\0'));
  const dca=b.indexOf(Buffer.from('DCA\0'));
  if(dcp<0||dca<0) throw Error('Missing DCX markers');
  const codec=b.toString('ascii',dcp+4,dcp+8);
  const payload=b.subarray(dca+b.readUInt32BE(dca+4));
  let bytes;
  if(codec==='DFLT') bytes=zlib.inflateSync(payload,{maxOutputLength:512*1024*1024});
  else if(codec==='ZSTD') bytes=zlib.zstdDecompressSync(payload,{maxOutputLength:512*1024*1024});
  else throw Error(`Unsupported DCX codec ${codec}; not decoded`);
  const dcs=b.indexOf(Buffer.from('DCS\0'));
  if(dcs>=0&&bytes.length!==b.readUInt32BE(dcs+4)) throw Error('DCX size mismatch');
  return {bytes,codec};
}
const reverse = n => parseInt(n.toString(2).padStart(8,'0').split('').reverse().join(''),2);
function binder(b) {
  if(b.toString('ascii',0,4)!=='BND4') throw Error('Not BND4');
  const be=!!b[9],bitBe=!b[10];
  const u32=o=>be?b.readUInt32BE(o):b.readUInt32LE(o);
  const i32=o=>be?b.readInt32BE(o):b.readInt32LE(o);
  const u64=o=>Number(be?b.readBigUInt64BE(o):b.readBigUInt64LE(o));
  const count=u32(12),stride=u64(32),unicode=!!b[48],raw=b[49];
  const format=bitBe||((raw&1)&&!(raw&128))?raw:reverse(raw);
  if(u64(16)!==64||count>100000||64+count*stride>b.length) throw Error('Invalid BND4 header bounds');
  const expected=16+(format&16?8:4)+(format&32?8:0)+(format&2?4:0)+(format&12?4:0)+(format===4?8:0);
  if(stride!==expected) throw Error('Unsupported BND4 header size');
  const files=[];
  for(let n=0;n<count;n++) {
    const base=64+n*stride;let p=base+8;
    if(i32(base+4)!==-1) throw Error('Invalid BND4 sentinel');
    const flags=bitBe?b[base]:reverse(b[base]);
    const size=u64(p);p+=8;let unpackedSize=null;
    if(format&32){unpackedSize=u64(p);p+=8;}
    const offset=format&16?u64(p):u32(p);p+=format&16?8:4;
    const id=format&2?i32(p):null;if(format&2)p+=4;
    let name=null;
    if(format&12){let q=u32(p),end=q;if(q>=b.length)throw Error('Invalid name offset');
      if(unicode){while(end+1<b.length&&b.readUInt16LE(end)!==0)end+=2;let text=b.subarray(q,end);if(be){text=Buffer.from(text);text.swap16();}name=text.toString('utf16le');}
      else {while(end<b.length&&b[end]!==0)end++;name=b.toString('latin1',q,end);}}
    if(!Number.isSafeInteger(offset)||!Number.isSafeInteger(size)||offset<0||offset+size>b.length)throw Error('Invalid member range');
    let bytes=b.subarray(offset,offset+size),error=null;
    if(flags&1){try{bytes=unwrap(bytes).bytes;}catch(e){error=e.message;}}
    if(!error&&unpackedSize!==null&&unpackedSize!==bytes.length)throw Error('Member size mismatch');
    const ascii=bytes.toString('latin1');
    let param=null;
    if(name?.endsWith('.param')&&!error){
      const pbe=bytes[44]===255;
      const r16=o=>pbe?bytes.readUInt16BE(o):bytes.readUInt16LE(o);
      const r32=o=>pbe?bytes.readUInt32BE(o):bytes.readUInt32LE(o);
      const r64=o=>Number(pbe?bytes.readBigUInt64BE(o):bytes.readBigUInt64LE(o));
      const fmt=bytes[45],rowCount=r16(10),long=!!(fmt&4);
      param={bigEndian:pbe,formatFlags:fmt,dataVersion:r16(8),rowCount,rowIds:null};
      const typeOffset=fmt&128?r64(16):12;let end=typeOffset;
      while(end<bytes.length&&bytes[end]!==0)end++;
      param.type=bytes.toString('ascii',typeOffset,end);
      if(long){const start=64,stride=24,dataStart=r64(48);
        if(start+stride*rowCount<=dataStart&&dataStart<=bytes.length){
          const rowIds=[];
          for(let row=0;row<rowCount;row++){const at=start+row*stride,offset=r64(at+8);if(offset<dataStart||offset>=bytes.length)throw Error('PARAM row offset outside payload');rowIds.push(pbe?bytes.readInt32BE(at):bytes.readInt32LE(at));}
          param.rowIds=rowIds;
        }
      }
    }
    files.push({id,name,flags,offset,size,unpackedSize,sha256:sha(bytes),decoded:!error,error,
      magic:bytes.subarray(0,16).toString('hex'),
      havokVersions:[...new Set(ascii.match(/hk_20\d\d[^\x00\s]{0,35}/g)||[])],
      havokClasses:[...new Set(ascii.match(/(?:hka|hkb|hkx)[A-Z][A-Za-z0-9]{3,70}/g)||[])],
      param,
      taeHeader:bytes.toString('ascii',0,4)==='TAE '?{version:bytes.readUInt32LE(8),headerHex:bytes.subarray(0,64).toString('hex')}:null});
  }
  return {version:b.toString('ascii',24,32).replace(/\0/g,''),bigEndian:be,format,count,files};
}
const inputs=JSON.parse(fs.readFileSync(path.join(root,'mod-inventory.json'),'utf8').replace(/^\uFEFF/,'')).files.map(f=>f.path).filter(p=>p.endsWith('.dcx')||p==='regulation.bin');
const results=[];
for(const input of inputs){
  const source=fs.readFileSync(path.join(root,'inputs',input));
  const result={input,sourceSha256:sha(source),sourceBytes:source.length};
  try{
    let bytes=source;
    if(input==='regulation.bin'){
      const cipher=crypto.createDecipheriv('aes-256-cbc',Buffer.from('99bffc366a6bc8c6f5827d093602d676c42892a01c207fb024d3af4e493fef99','hex'),bytes.subarray(0,16));
      cipher.setAutoPadding(false);bytes=Buffer.concat([cipher.update(bytes.subarray(16)),cipher.final()]);
      result.decryptedHeaderHex=bytes.subarray(0,96).toString('hex');
    }
    const decoded=unwrap(bytes);result.codec=decoded.codec;result.binder=binder(decoded.bytes);
  }catch(e){result.error=e.message;}
  results.push(result);
}
const text=fs.readFileSync(path.join(root,'c0000.mod.hks'),'utf8');
const lines=text.split(/\r?\n/),functions=[];let current=null;
lines.forEach((line,i)=>{const match=line.match(/^\s*(?:local\s+)?function\s+([\w.:]+)\s*\(/);if(match){if(current)current.endLine=i;current={name:match[1],startLine:i+1,endLine:lines.length};functions.push(current);}});
const ids=new Map();
lines.forEach((line,i)=>{const code=line.split('--')[0];for(const match of code.matchAll(/\b(?:env|act)\s*\(\s*(GetSpEffectID|AddSpEffect|ClearSpEffect)\s*,\s*(\d+)/g)){const id=Number(match[2]);if(!ids.has(id))ids.set(id,[]);ids.get(id).push({operation:match[1],line:i+1});}});
const hks={lines:lines.length,sha256:sha(Buffer.from(text)),functions,spEffects:[...ids].map(([id,uses])=>({id,uses})),
  namedModComments:lines.flatMap((line,i)=>/clever|modpack|trick weapon|tachikaze|voidwalker|bloodstarved|icefrayed|boltsplitter/i.test(line)?[{line:i+1,text:line.trim()}]:[])};
fs.writeFileSync(path.join(root,'container-analysis.json'),JSON.stringify(results,null,2));
fs.writeFileSync(path.join(root,'hks-analysis.json'),JSON.stringify(hks,null,2));
const effects=results.find(r=>r.input==='regulation.bin')?.binder?.files.find(f=>f.name.endsWith('\\SpEffectParam.param'))?.param;
if(effects?.rowIds){const present=new Set(effects.rowIds);fs.writeFileSync(path.join(root,'hks-param-crosscheck.json'),JSON.stringify({scope:'Literal SpEffect IDs in HKS versus all SpEffectParam row IDs in supplied regulation. Presence does not establish semantics or platform compatibility.',checked:ids.size,present:[...ids.keys()].filter(id=>present.has(id)),missing:[...ids.keys()].filter(id=>!present.has(id))},null,2));}
console.log(JSON.stringify({containers:results.map(r=>({input:r.input,codec:r.codec,error:r.error,version:r.binder?.version,count:r.binder?.count,extensions:r.binder?.files.reduce((a,f)=>{const ext=path.win32.extname(f.name||'');a[ext]=(a[ext]||0)+1;return a;},{})})),hks:{lines:hks.lines,functions:functions.length,spEffectIds:ids.size,namedComments:hks.namedModComments.length}},null,2));
