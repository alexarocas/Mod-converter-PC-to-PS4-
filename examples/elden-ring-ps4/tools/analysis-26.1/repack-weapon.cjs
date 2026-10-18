const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const {binder}=require('./hkx-layout.cjs');const base='analysis-26.1/model-conversion/',out=base+'experimental/',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const context={require,Buffer,__dirname:path.resolve(out)};vm.createContext(context);vm.runInContext(fs.readFileSync('analysis-ps4/task-015/build.cjs','utf8').split('const ps=')[0]+';globalThis.makeTable=table;',context);
function pack(template,members){
 assert.equal(template[9],0);assert.equal(template[49],116);assert.equal(Number(template.readBigUInt64LE(32)),36);const originals=binder(template);
 assert.equal(new Set(members.map(m=>m.id)).size,members.length);assert.equal(new Set(members.map(m=>m.name.toLowerCase())).size,members.length);
 let cursor=64+36*members.length;const names=members.map(m=>Buffer.from(m.name+'\0','utf16le')),nameOffsets=names.map(n=>{const off=cursor;cursor+=n.length;return off;});
 const tableStart=Math.ceil(cursor/8)*8,table=context.makeTable(members,tableStart),end=tableStart+table.length;cursor=Math.ceil(end/16)*16;
 const offsets=members.map(m=>{cursor=Math.ceil(cursor/16)*16;const off=cursor;cursor+=m.data.length;return off;}),b=Buffer.alloc(cursor);template.copy(b,0,0,64);b.writeUInt32LE(members.length,12);b.writeBigUInt64LE(BigInt(end),40);b.writeBigUInt64LE(BigInt(tableStart),56);table.copy(b,tableStart);
 members.forEach((m,i)=>{const index=originals.findIndex(o=>o.id===m.id);assert(index>=0);const p=64+i*36;template.copy(b,p,64+index*36,100+index*36);b.writeBigUInt64LE(BigInt(m.data.length),p+8);b.writeBigUInt64LE(BigInt(m.data.length),p+16);b.writeUInt32LE(offsets[i],p+24);b.writeInt32LE(m.id,p+28);b.writeUInt32LE(nameOffsets[i],p+32);names[i].copy(b,nameOffsets[i]);m.data.copy(b,offsets[i]);});
 const back=binder(b);assert.equal(back.length,members.length);back.forEach((m,i)=>{assert.equal(m.name,members[i].name);assert.equal(m.id,members[i].id);assert(m.bytes.equals(members[i].data));});return b;
}
module.exports={pack};
if(require.main===module){
const bindings=JSON.parse(fs.readFileSync(out+'weapon-binding-verification.json'));assert(bindings.every(b=>!b.issues.length));
const groups=JSON.parse(fs.readFileSync(out+'weapon-animation-conversion.json')),nested=new Map();
for(const g of groups){const template=fs.readFileSync(base+'mod-members/'+g.name),b=pack(template,g.members.map(m=>({...m,data:fs.readFileSync(m.filename)})));fs.writeFileSync(out+g.name,b);nested.set(g.name,b);}
const original=fs.readFileSync(base+'inputs/wp_a_9925.bnd');const members=binder(original).map(m=>{const name=path.win32.basename(m.name);let data=m.bytes;if(name.endsWith('.tpf'))data=fs.readFileSync(out+'WP_A_9925.tpf');else if(nested.has(name))data=nested.get(name);else assert(name.endsWith('.flver'));return {...m,name:m.name.replace('INTERROOT_win64','INTERROOT_ps4'),data};});
const b=pack(original,members);fs.writeFileSync(out+'wp_a_9925.bnd',b);fs.writeFileSync(out+'weapon-container-report.json',JSON.stringify({experimental:true,consoleTested:false,bndBytes:b.length,bndSHA256:sha(b),members:members.map(m=>({name:m.name,id:m.id,size:m.data.length,sha256:sha(m.data)})),limitations:['Geometry FLVER kept unchanged; runtime/material parameters not validated','Six weapon HKX have inferred instantiated layouts','BC7 sRGB format mapping without direct reference','Not a full-mod conversion']},null,2));console.log(JSON.stringify({bndBytes:b.length,sha256:sha(b),members:members.length}));
}
