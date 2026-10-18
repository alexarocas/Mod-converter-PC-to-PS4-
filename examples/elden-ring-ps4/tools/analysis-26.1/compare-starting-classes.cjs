const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm'),assert=require('assert/strict');
const out=__dirname,base=path.resolve('analysis-26.0'),sha=b=>crypto.createHash('sha256').update(b).digest('hex'),read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const ctx={require,Buffer,__dirname:base};vm.createContext(ctx);vm.runInContext(read(path.join(base,'analyze-mod.cjs')).split('const inputs=')[0]+';globalThis.api={unwrap,binder};',ctx);
const reader=read(path.join(base,'task-005/read-params.cjs'));
let parser=reader.slice(reader.indexOf(' const xmlpath='),reader.indexOf(' tables[name]=rows;'));
parser=parser.replace("path.join(out,'tools/Paramdex/ER/Defs',def+'.xml')","path.join(base,'task-005/tools/Paramdex/ER/Defs',def+'.xml')");
parser=parser.replace("let expected=refs.find(x=>x.table===name+'.param').rowSizeB;","let expected=offset;");
const parse=new Function('p','def','name','base','path','read',parser+';return {rows,fields,rowSize:offset,dataVersion:p.readUInt16LE(8),defVersion:+xml.match(/<DataVersion>(\\d+)/)[1]};');
let sources={},tables={};
for(const [tag,file] of Object.entries({A:'ps4-dump/union/regulation.bin',B:'analysis-26.1/inputs/regulation.bin'})){
 const original=fs.readFileSync(file);sources[tag]={file,sha256:sha(original)};
 assert(sources[tag].sha256.startsWith(tag==='A'?'7b6d07c3':'a15dac19'));
 const c=crypto.createDecipheriv('aes-256-cbc',Buffer.from('99bffc366a6bc8c6f5827d093602d676c42892a01c207fb024d3af4e493fef99','hex'),original.subarray(0,16));c.setAutoPadding(false);
 const b=ctx.api.unwrap(Buffer.concat([c.update(original.subarray(16)),c.final()])).bytes,entries=ctx.api.binder(b).files;tables[tag]={};
 for(const name of ['CharaInitParam','EquipParamWeapon']){const e=entries.find(e=>path.win32.basename(e.name)===name+'.param');assert(e);const p=b.subarray(e.offset,e.offset+e.size),t=parse(p,name,name,base,path,read);assert.equal(t.dataVersion,t.defVersion);t.memberSha256=sha(p);tables[tag][name]=t;}
}
const names=n=>Object.fromEntries(read(path.join(base,'task-005/tools/Paramdex/ER/Names',n+'.txt')).split(/\r?\n/).map(l=>{const m=l.match(/^(\d+) (.*)$/);return m?[m[1],m[2]]:[]}).filter(x=>x.length));
let diffs=[],weaponIds=new Set();const cn=names('CharaInitParam'),wn=names('EquipParamWeapon');
for(let id=3000;id<=3009;id++){const a=tables.A.CharaInitParam.rows.find(r=>r.id===id),b=tables.B.CharaInitParam.rows.find(r=>r.id===id);assert(a&&b);for(const k of Object.keys(a)){if(/equip.*wep/i.test(k)&&a[k]>=0)weaponIds.add(a[k]);if(/equip.*wep/i.test(k)&&b[k]>=0)weaponIds.add(b[k]);if(a[k]!==b[k])diffs.push({table:'CharaInitParam',id,name:cn[id],field:k,A:a[k],B:b[k]});}}
for(const id of weaponIds){const a=tables.A.EquipParamWeapon.rows.find(r=>r.id===id),b=tables.B.EquipParamWeapon.rows.find(r=>r.id===id);if(!a||!b)continue;for(const k of Object.keys(a))if(a[k]!==b[k])diffs.push({table:'EquipParamWeapon',id,name:wn[id],field:k,A:a[k],B:b[k]});}
fs.writeFileSync(path.join(out,'extraccion.json'),JSON.stringify({sources,tables,weaponIds:[...weaponIds],diffs},null,2));console.log(JSON.stringify({sources,weaponIds:[...weaponIds],diffs},null,2));
