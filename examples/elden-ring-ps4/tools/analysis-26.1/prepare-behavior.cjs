const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const out=path.resolve('analysis-26.1/behavior-conversion');fs.mkdirSync(out,{recursive:true});
const source=path.resolve('analysis-26.1/inputs/chr/c0000.behbnd.dcx');
const context={require,Buffer,__dirname:path.resolve('analysis-26.0')};vm.createContext(context);
vm.runInContext(fs.readFileSync('analysis-26.0/analyze-mod.cjs','utf8').split('const inputs=')[0]+';globalThis.api={unwrap,binder};',context);
const raw=fs.readFileSync(source),decoded={bytes:fs.readFileSync(path.join(out,'behavior.bnd')),codec:'KRAK'},binder=context.api.binder(decoded.bytes);
const manifest=[];
for(const entry of binder.files){
const name=path.win32.basename(entry.name);if(!name||name==='.'||name==='..')throw Error('Invalid basename');
const relative=entry.name.replace(/^[A-Za-z]:[\\/]/,'').split(/[\\/]+/).filter(Boolean);
if(relative.some(part=>part==='.'||part==='..'))throw Error('Unsafe member path');
const dest=path.join(out,'input-tree',...relative);fs.mkdirSync(path.dirname(dest),{recursive:true});
const bytes=decoded.bytes.subarray(entry.offset,entry.offset+entry.size);if(entry.flags&1)throw Error('Compressed member');
if(fs.existsSync(dest)&&!fs.readFileSync(dest).equals(bytes))throw Error('Conflicting output: '+dest);
fs.writeFileSync(dest,bytes);manifest.push({...entry,localPath:dest});
}
fs.mkdirSync(path.join(out,'output'),{recursive:true});
const preset=fs.readFileSync('PS4write2.hko','utf8');
const adapted=preset.replace('D:\\CLEV MOD\\PS4write Output\\$(asset).hkx',path.join(out,'output','$(asset).hkx'));
if(adapted===preset)throw Error('Preset path replacement failed');
fs.writeFileSync(path.join(out,'PS4write-local.hko'),adapted);
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({source,sha256:crypto.createHash('sha256').update(raw).digest('hex'),codec:decoded.codec,files:manifest},null,2));
console.log(JSON.stringify({codec:decoded.codec,files:manifest.map(e=>({name:path.win32.basename(e.name),size:e.size,magic:e.magic}))},null,2));
