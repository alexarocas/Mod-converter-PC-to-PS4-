const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const {binder}=require('./hkx-layout.cjs'),base='analysis-26.1/animation-conversion',out=path.join(base,'experimental');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const helpers=fs.readFileSync('analysis-ps4/task-015/build.cjs','utf8').split('const ps=')[0],ctx={require,Buffer,__dirname:path.resolve(out)};vm.createContext(ctx);vm.runInContext(helpers+';globalThis.makeTable=table;',ctx);
const reports=[];
for(const name of ['c0000.anibnd.dcx','c0000_a00_hi.anibnd.dcx','c0000_a6x.anibnd.dcx']){
 const template=fs.readFileSync(path.join(base,'ps4-'+name+'.bnd')),original=binder(template),manifest=JSON.parse(fs.readFileSync(path.join(out,name,'manifest.json'),'utf8'));
 assert.equal(template[9],0);assert.equal(template[49],116);assert.equal(Number(template.readBigUInt64LE(32)),36);assert(original.every(f=>f.flags===2),'original flags');
 const members=manifest.members.map(m=>{const bytes=fs.readFileSync(m.filename);assert.equal(sha(bytes),m.sha256);return {...m,data:bytes};}),retainedOriginalOnly=[];
 if(name==='c0000.anibnd.dcx')for(const entry of original){if(members.some(m=>m.name===entry.name))continue;assert(entry.name.endsWith('.tae'),'unexpected original-only resource');assert.equal(entry.bytes.readUInt32LE(84),0,'original-only TAE is not empty');members.push({id:entry.id,name:entry.name,data:entry.bytes});retainedOriginalOnly.push(entry.name);}
 assert.equal(new Set(members.map(m=>m.id)).size,members.length,'duplicate member id');assert.equal(new Set(members.map(m=>m.name.toLowerCase())).size,members.length,'duplicate member path');
 const strings=members.map(m=>Buffer.from(m.name+'\0','utf16le'));let cursor=64+36*members.length;const nameOffsets=strings.map(s=>{const p=cursor;cursor+=s.length;return p;}),tableStart=Math.ceil(cursor/8)*8,table=ctx.makeTable(members,tableStart),headerEnd=tableStart+table.length;
 cursor=Math.ceil(headerEnd/16)*16;const dataOffsets=members.map(m=>{cursor=Math.ceil(cursor/16)*16;const p=cursor;cursor+=m.data.length;return p;}),bytes=Buffer.alloc(cursor);template.copy(bytes,0,0,64);bytes.writeUInt32LE(members.length,12);bytes.writeBigUInt64LE(BigInt(headerEnd),40);bytes.writeBigUInt64LE(BigInt(tableStart),56);table.copy(bytes,tableStart);
 members.forEach((m,i)=>{const at=64+i*36;template.copy(bytes,at,64,100);bytes.writeBigUInt64LE(BigInt(m.data.length),at+8);bytes.writeBigUInt64LE(BigInt(m.data.length),at+16);bytes.writeUInt32LE(dataOffsets[i],at+24);bytes.writeInt32LE(m.id,at+28);bytes.writeUInt32LE(nameOffsets[i],at+32);strings[i].copy(bytes,nameOffsets[i]);m.data.copy(bytes,dataOffsets[i]);});
 const check=binder(bytes);assert.equal(check.length,members.length);for(let i=0;i<members.length;i++){assert.equal(check[i].name,members[i].name);assert.equal(check[i].id,members[i].id);assert(check[i].bytes.equals(members[i].data),'BND member mismatch');}
 fs.writeFileSync(path.join(out,name+'.bnd'),bytes);const report={name,experimental:true,consoleTested:false,members:members.length,rawSize:bytes.length,rawSha256:sha(bytes),retainedOriginalOnly,skeletonUntouched:name==='c0000.anibnd.dcx',allMembersVerified:true};reports.push(report);console.log(JSON.stringify(report));
}
fs.writeFileSync(path.join(out,'container-report.json'),JSON.stringify(reports,null,2));
