const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {schemas}=require('./audit-animations.cjs');
const ps4=schemas('ps4'),mod=schemas('mod'),catalog=new Map();
for(const schema of ps4.unique.values())for(let i=1;i<schema.types.length;i++)catalog.set(schema.registry.identity(i),{schema,index:i,type:schema.registry.type(i)});
const aligned=(n,a)=>Math.ceil(n/a)*a,checks=[],inferred=[];
for(const schema of mod.unique.values()){
 const r=schema.registry,cache=new Map();
 function layout(i){if(!i)return null;if(cache.has(i))return cache.get(i);const t=r.type(i),raw=schema.types[i],ref=catalog.get(t.identity),record=(t.format&15)===7;let candidate;
 if(record){const parent=layout(t.parent);let cursor=parent?.dataEnd??(t.fields.length?Math.min(...t.fields.map(f=>f.offset)):t.size);const fields=[];for(const f of raw.fields||[]){const ft=layout(f.type);cursor=aligned(cursor,ft.alignment);fields.push({...f,offset:cursor});cursor+=ft.size;}const alignment=Math.max(t.alignment,parent?.alignment||1,...(raw.fields||[]).map(f=>layout(f.type).alignment));candidate={size:aligned(cursor,alignment),alignment,dataEnd:cursor,fields};}
 else candidate={size:t.size,alignment:t.alignment,dataEnd:t.size,fields:raw.fields||[]};
 if(ref){const expected=ref.type,targetOwn=ref.schema.types[ref.index].fields||[];if(record)checks.push({schema:schema.digest,identity:t.identity,match:candidate.size===expected.size&&candidate.alignment===expected.alignment&&JSON.stringify(candidate.fields.map(f=>({name:f.name,offset:f.offset})))===JSON.stringify(targetOwn.map(f=>({name:f.name,offset:f.offset}))),candidate:{size:candidate.size,alignment:candidate.alignment,fields:candidate.fields.map(f=>({name:f.name,offset:f.offset}))},expected:{size:expected.size,alignment:expected.alignment,fields:targetOwn.map(f=>({name:f.name,offset:f.offset}))}});
 const end=expected.fields.length?Math.max(...expected.fields.map(f=>f.offset+ref.schema.registry.type(f.type).size)):expected.size;candidate={size:expected.size,alignment:expected.alignment,dataEnd:end,fields:targetOwn};
 }else if(record)inferred.push({schema:schema.digest,identity:t.identity,sourceSize:t.size,...candidate,ownFieldNames:candidate.fields.map(f=>f.name)});
 cache.set(i,candidate);return candidate;
 }
 for(let i=1;i<schema.types.length;i++)layout(i);
}
const report={knownRecordChecks:checks.length,matchingChecks:checks.filter(c=>c.match).length,mismatches:checks.filter(c=>!c.match),inferredUnknownRecords:inferred};fs.writeFileSync('analysis-26.1/animation-conversion/native-layout-inference.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,inferredUnknownRecords:inferred.map(({fields,...rest})=>rest)},null,2));
