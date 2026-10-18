const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {binder}=require('./hkx-layout.cjs'),{pack}=require('./repack-weapon.cjs'),{convertTPF}=require('./convert-model-textures.cjs');
const {convertMember}=require('./convert-weapon-animations.cjs'),{verifyGroups}=require('./verify-weapon-bindings.cjs'),{compendia,sourceType,replaceType,makeNativeSchemaBuilder}=require('./animation-schema.cjs');
const root='analysis-26.1/asset-conversion/',audit=JSON.parse(fs.readFileSync(root+'asset-audit.json'));
const nativePhysics=['bd_m_1010.bnd','c0000.chrbnd'].flatMap(name=>binder(fs.readFileSync('analysis-26.1/model-conversion/ps4-original/'+name)).filter(m=>/\.hkx$/i.test(m.name)).map(m=>m.bytes));
const build=makeNativeSchemaBuilder(nativePhysics),sha=b=>crypto.createHash('sha256').update(b).digest('hex'),report=[],cache=new Map();
const category=process.argv.includes('--sfx')?'sfx':process.argv.includes('--aux')?'aux':'parts';
const selected=audit.filter(a=>category==='aux'?/^(chr|menu|msg)\//.test(a.path):a.path.startsWith(category+'/'));
const physicsReference=binder(fs.readFileSync('analysis-26.1/model-conversion/ps4-original/c0000.chrbnd'));
function convertBinder(raw,label,details){
 const original=binder(raw),comps=compendia(original),members=[];
 for(const m of original){
  const name=path.win32.basename(m.name);let data=m.bytes;
  if(/\.compendium$/i.test(name))continue;
  if(/\.tpf$/i.test(name)){const result=convertTPF(data);data=result.bytes;details.textures.push({member:m.name,...result.report});}
  else if(/\.hkx$/i.test(name)){const result=convertMember(m,comps,build);data=result.bytes;details.hkx.push({member:m.name,...result.detail});}
  else if(/\.anibnd$/i.test(name))data=convertBinder(data,label+'/'+name,details);
  else if(/\.(hkxpwv|bsipwv)$/i.test(name)){const native=physicsReference.find(x=>path.win32.basename(x.name)===name);assert(native&&native.bytes.equals(data),'Changed physics auxiliary data '+name);}
  else if(/\.fmg$/i.test(name)){assert(label.startsWith('msg/'));assert(data.length>=32);details.messageFilesPreserved=(details.messageFilesPreserved||0)+1;}
  else assert(/\.(flver|fxr|ffxreslist)$/i.test(name),'Unsupported member '+name);
  members.push({...m,name:m.name.replace('INTERROOT_win64','INTERROOT_ps4'),data});
 }
 const hkxMembers=members.filter(m=>/\.hkx$/i.test(m.name));
 if(hkxMembers.length){
  const hasSkeleton=hkxMembers.some(m=>/skeleton[^\\/]*\.hkx$/i.test(m.name));
  if(hasSkeleton){const checks=verifyGroups([{name:label,members:hkxMembers.map(m=>({...m,bytes:m.data}))}]);details.bindings.push(...checks);
   if(checks.some(c=>c.issues.length)){
    const sourceChecks=verifyGroups([{name:label,members:original.filter(m=>/\.hkx$/i.test(m.name)).map(m=>({...m,name:m.name.replace('INTERROOT_win64','INTERROOT_ps4'),bytes:replaceType(m.bytes,sourceType(m.bytes,comps))}))}]);
    assert.deepEqual(checks,sourceChecks,'Conversion introduced binding issues');details.sourceBindingWarnings.push({group:label,issues:checks.flatMap(c=>c.issues)});
   }
  }
  else details.externalSkeletonGroups.push(label);
 }
 return pack(raw,members);
}
for(const a of selected){
 if(cache.has(a.sha256)){report.push({...cache.get(a.sha256),path:a.path,duplicateOf:cache.get(a.sha256).path});continue;}
 const record={path:a.path,sourceSHA256:a.sha256,status:'blocked',details:{textures:[],hkx:[],bindings:[],externalSkeletonGroups:[],sourceBindingWarnings:[]}};
 try{
  const raw=fs.readFileSync(a.rawFilename);let converted;
  if(raw.toString('ascii',0,4)==='TPF\0'){const result=convertTPF(raw);converted=result.bytes;record.details.textures.push({member:a.path,...result.report});}
  else converted=convertBinder(raw,a.path,record.details);
  const dest=root+'converted/'+a.sha256+(raw.toString('ascii',0,4)==='TPF\0'?'.tpf':'.bnd');
  fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,converted);record.rawFilename=dest;record.rawBytes=converted.length;record.rawSHA256=sha(converted);record.status=record.details.sourceBindingWarnings.length?'prepared_with_source_warnings':'prepared';
 }catch(e){record.error=e.message;}
 cache.set(a.sha256,record);report.push(record);console.log(a.path+': '+record.status+(record.error?' / '+record.error:''));
 fs.writeFileSync(root+category+'-conversion.json',JSON.stringify(report,null,2));
}
console.log(JSON.stringify({files:report.length,prepared:report.filter(r=>r.status==='prepared').length,blocked:report.filter(r=>r.status!=='prepared').map(r=>({path:r.path,error:r.error}))},null,2));
