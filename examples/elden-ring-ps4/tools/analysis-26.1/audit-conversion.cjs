const fs=require('fs'),path=require('path'),{hkx,registry,binder,normalize}=require('./hkx-layout.cjs');
const mod=binder(fs.readFileSync('analysis-26.1/behavior-conversion/behavior.bnd'));
const ps4=binder(fs.readFileSync('analysis-26.1/ps4-1.17.1/chr/behavior.bnd'));
const results=[];
for(const e of mod){const target=ps4.find(p=>normalize(p.name)===normalize(e.name)),a=hkx(e.bytes),b=hkx(target.bytes),ar=registry(a.types),br=registry(b.types);const missing=[],differences=[];
for(let i=1;i<a.types.length;i++){const t=ar.type(i),u=br.byIdentity.get(t.identity);if(!u){missing.push(t.identity);continue;}const fields=(t,r)=>t.fields.map(f=>({name:f.name,offset:f.offset,identity:r.identity(f.type),flags:f.flags}));const aa={size:t.size,alignment:t.alignment,format:t.format,subType:ar.identity(t.subType),fields:fields(t,ar)},bb={size:u.size,alignment:u.alignment,format:u.format,subType:br.identity(u.subType),fields:fields(u,br)};if(JSON.stringify(aa)!==JSON.stringify(bb))differences.push({identity:t.identity,source:aa,target:bb,instances:a.items.filter(x=>x.type===i).reduce((n,x)=>n+x.count,0)});}
results.push({member:e.name,sourceTypes:a.types.length-1,targetTypes:b.types.length-1,items:a.items.length,patches:a.patches.reduce((n,p)=>n+p.offsets.length,0),missingTypes:missing,differences});}
fs.writeFileSync('analysis-26.1/behavior-conversion/conversion-audit.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(r=>({...r,differences:r.differences.map(d=>({identity:d.identity,sourceSize:d.source.size,targetSize:d.target.size,instances:d.instances,sourceOnlyFields:d.source.fields.filter(f=>!d.target.fields.some(t=>t.name===f.name)),targetOnlyFields:d.target.fields.filter(f=>!d.source.fields.some(t=>t.name===f.name))}))})),null,2));
