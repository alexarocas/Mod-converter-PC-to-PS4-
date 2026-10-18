const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {binder}=require('./hkx-layout.cjs'),{pack}=require('./repack-weapon.cjs');
const root='analysis-26.1/',base=root+'asset-conversion/',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function readFMG(b){
 assert(b.length>=40);assert.equal(b.readUInt32LE(0),0x00020000,'Only LE FMG v2');assert.equal(b[8],1,'Unicode required');assert.equal(b.readUInt32LE(4),b.length);assert.equal(b.readUInt32LE(20),255);
 const groups=b.readUInt32LE(12),count=b.readUInt32LE(16),offsets=Number(b.readBigUInt64LE(24)),map=new Map();assert(40+groups*16<=offsets);assert(offsets+count*8<=b.length);
 for(let i=0;i<groups;i++){
  const p=40+i*16,start=b.readUInt32LE(p),first=b.readInt32LE(p+4),last=b.readInt32LE(p+8);assert(last>=first&&last-first<count);assert(start+last-first<count);
  for(let id=first;id<=last;id++){const off=Number(b.readBigUInt64LE(offsets+(start+id-first)*8));let text=null;if(off){assert(off>=offsets+count*8&&off<b.length);let end=off;while(end+2<=b.length&&b.readUInt16LE(end))end+=2;assert(end+2<=b.length);text=b.toString('utf16le',off,end);}assert(!map.has(id),'Duplicate FMG id');map.set(id,text);}
 }assert.equal(map.size,count);return map;
}
function writeFMG(map){
 const entries=[...map].sort((a,b)=>a[0]-b[0]),groups=[];entries.forEach(([id],i)=>{const g=groups.at(-1);if(g&&id===g.last+1)g.last=id;else groups.push({index:i,first:id,last:id});});
 const offsets=40+groups.length*16,dataStart=offsets+entries.length*8,strings=entries.map(([,s])=>s===null?null:Buffer.from(s+'\0','utf16le'));let size=dataStart;for(const s of strings)if(s)size+=s.length;
 const b=Buffer.alloc(size);b[2]=2;b[8]=1;b.writeUInt32LE(size,4);b.writeUInt32LE(groups.length,12);b.writeUInt32LE(entries.length,16);b.writeUInt32LE(255,20);b.writeBigUInt64LE(BigInt(offsets),24);
 groups.forEach((g,i)=>{const p=40+i*16;b.writeUInt32LE(g.index,p);b.writeInt32LE(g.first,p+4);b.writeInt32LE(g.last,p+8);});let pos=dataStart;strings.forEach((s,i)=>{if(s){b.writeBigUInt64LE(BigInt(pos),offsets+i*8);s.copy(b,pos);pos+=s.length;}});assert.deepEqual(readFMG(b),new Map(entries));return b;
}
const audit=JSON.parse(fs.readFileSync(base+'asset-audit.json')),mod=binder(fs.readFileSync(audit.find(a=>a.path.startsWith('msg/')).rawFilename));
const eng=binder(fs.readFileSync(root+'model-conversion/ps4-original/item-engus.bnd')),spanishRaw=fs.readFileSync(root+'model-conversion/ps4-original/item-spaes.bnd'),spanish=binder(spanishRaw),byBase=members=>new Map(members.map(m=>[path.win32.basename(m.name).toLowerCase(),m]));
const modMap=byBase(mod),engMap=byBase(eng),report=[];
const members=spanish.map(m=>{
 const key=path.win32.basename(m.name).toLowerCase(),s=readFMG(m.bytes),mm=modMap.get(key),em=engMap.get(key);assert(mm&&em,'Missing language counterpart '+key);
 const english=readFMG(em.bytes),modified=readFMG(mm.bytes),patches=[];
 for(const [id,text]of modified){if(text===null||text===english.get(id))continue;const before=s.get(id);if(before!==text){s.set(id,text);patches.push({id,before:before??null,after:text,added:!english.has(id)});}}
 const data=patches.length?writeFMG(s):m.bytes,check=readFMG(data),old=readFMG(m.bytes),patched=new Set(patches.map(p=>p.id));
 for(const [id,text]of old)if(!patched.has(id))assert.equal(check.get(id),text,'Untouched Spanish text changed');
 for(const p of patches)assert.equal(check.get(p.id),p.after);
 report.push({file:key,changes:patches.length,patches});return {...m,data};
});
assert.equal(mod.length,spanish.length,'Extra mod FMG tables need handling');
const result=pack(spanishRaw,members),filename=base+'converted/item-spaes.bnd';fs.writeFileSync(filename,result);
const summary={baseLanguage:'Español de España',modTextLanguage:'English, original mod text',strategy:'Keep original Spanish; overlay only non-null changes relative to current native English',changes:report.reduce((n,r)=>n+r.changes,0),arts:report.filter(r=>/artsname|gemname/.test(r.file)),files:report};
fs.writeFileSync(base+'spanish-text-report.json',JSON.stringify(summary,null,2));fs.writeFileSync(base+'spanish-conversion.json',JSON.stringify([{path:'msg/spaes/item_dlc02.msgbnd.dcx',status:'prepared',rawFilename:filename,rawBytes:result.length,rawSHA256:sha(result),consoleTested:false}],null,2));
console.log(JSON.stringify({changes:summary.changes,filesChanged:report.filter(r=>r.changes).length,arts:summary.arts.map(r=>({file:r.file,changes:r.changes,samples:r.patches.slice(0,4)}))},null,2));
