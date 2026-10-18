const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const {binder}=require('./hkx-layout.cjs'),{convertTPF}=require('./convert-model-textures.cjs');
const root='analysis-26.1/',output=root+'asset-conversion/';fs.mkdirSync(output,{recursive:true});
const ctx={require,Buffer,__dirname:path.resolve(root)};vm.createContext(ctx);vm.runInContext(fs.readFileSync('analysis-26.0/analyze-mod.cjs','utf8').split('const inputs=')[0]+';globalThis.unwrap=unwrap;',ctx);
const inventory=JSON.parse(fs.readFileSync(root+'mod-inventory.json')),cache=new Map(),report=[];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const item of inventory.files.filter(f=>/^(parts|sfx|menu|msg)\//.test(f.path)||f.path.endsWith('.chrbnd.dcx'))){
 const source=fs.readFileSync(root+'inputs/'+item.path);assert.equal(sha(source),item.sha256);
 if(cache.has(item.sha256)){report.push({...cache.get(item.sha256),path:item.path,duplicateOf:cache.get(item.sha256).path});continue;}
 const record={path:item.path,sha256:item.sha256,bytes:source.length,entries:[],issues:[]};
 try{
  const dir=output+'sources/'+item.sha256;fs.mkdirSync(dir,{recursive:true});const raw=source.toString('ascii',40,44)==='KRAK'?fs.readFileSync(dir+'/container.bin'):ctx.unwrap(source).bytes;fs.writeFileSync(dir+'/container.bin',raw);record.rawFilename=dir+'/container.bin';
  const members=raw.toString('ascii',0,4)==='TPF\0'?[{name:path.posix.basename(item.path).replace(/\.dcx$/,''),bytes:raw}]:binder(raw);
  for(const m of members){
   assert(m.name);const name=path.win32.basename(m.name),entry={name,id:m.id,bytes:m.bytes.length,sha256:sha(m.bytes)};
   if(/\.tpf$/i.test(name)){
    try{const result=convertTPF(m.bytes);entry.textures=result.report.textures.map(({name,width,height,mips,dxgi,sourceFormat,format})=>({name,width,height,mips,dxgi,sourceFormat,format}));entry.tpfConvertible=true;}catch(e){entry.tpfConvertible=false;entry.error=e.message;record.issues.push(name+': '+e.message);}
   }else if(/\.anibnd$/i.test(name)){
    try{entry.nestedMembers=binder(m.bytes).map(x=>({name:path.win32.basename(x.name),bytes:x.bytes.length,magic:x.bytes.toString('ascii',0,4),tag:x.bytes.toString('ascii',4,8)}));}catch(e){record.issues.push(name+': '+e.message);}
   }else if(/\.flver$/i.test(name)){entry.version=m.bytes.readUInt32LE(8);entry.endian=m.bytes.toString('ascii',6,8);}
   record.entries.push(entry);
  }
 }catch(e){record.issues.push(e.message);}
 cache.set(item.sha256,record);report.push(record);console.log(item.path+': '+record.entries.length+' members, '+record.issues.length+' issues');
}
fs.writeFileSync(output+'asset-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({files:report.length,unique:cache.size,issues:report.filter(r=>r.issues.length).map(r=>({path:r.path,issues:r.issues}))},null,2));
