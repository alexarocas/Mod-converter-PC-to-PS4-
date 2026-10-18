const fs=require('fs'),path=require('path');
const old=JSON.parse(fs.readFileSync('analysis-ps4/task-017/formato.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('analysis-26.1/behavior-conversion/manifest.json','utf8'));
const parseTypes=require('../analysis-ps4/task-017/types.cjs');
function sections(b,start=0,end=b.length){let out=[];for(let p=start;p<end;){if(p+8>end)throw Error('short section');const word=b.readUInt32BE(p),size=word&0xfffffff,id=b.toString('ascii',p+4,p+8);if(size<8||p+size>end)throw Error('section bounds');out.push({id,offset:p,size});if(['TAG0','TYPE','INDX','TCM0'].includes(id))out.push(...sections(b,p+8,p+size));p+=size;}return out;}
const baseline=old.containers.find(c=>c.name==='c0000.behbnd').sides.ps4;
const result=[];
for(const entry of manifest.files){const b=fs.readFileSync(entry.localPath),types=parseTypes(b,sections(b));const normalized=n=>n.replace(/INTERROOT_(ps4|win64)/,'INTERROOT_PLATFORM');const ps4=baseline.hkx.find(h=>normalized(h.name)===normalized(entry.name));if(!ps4)throw Error('No matching PS4 member');
const diffs=[];for(const t of types.filter(Boolean)){const matches=ps4.types.filter(p=>p&&p.name===t.name&&JSON.stringify(p.parameters.map(x=>x.name))===JSON.stringify(t.parameters.map(x=>x.name)));if(matches.length!==1)continue;const p=matches[0];const shape=(x,table)=>({size:x.size,alignment:x.alignment,fields:(x.fields||[]).map(f=>({name:f.name,offset:f.offset,type:table[f.type]?.name,flags:f.flags}))});const a=shape(p,ps4.types),c=shape(t,types);if(JSON.stringify(a)!==JSON.stringify(c))diffs.push({name:t.name,ps4:a,mod26_1:c});}
result.push({member:entry.name,types:types.length-1,differences:diffs});}
fs.writeFileSync('analysis-26.1/behavior-conversion/layout-comparison.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result.map(r=>({member:r.member,types:r.types,differences:r.differences.map(d=>({name:d.name,ps4Size:d.ps4.size,modSize:d.mod26_1.size}))})),null,2));
