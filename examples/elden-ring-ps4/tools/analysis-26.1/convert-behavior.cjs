// Experimental structural conversion. No game code or third-party DLL is loaded.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {hkx,registry,binder,normalize}=require('./hkx-layout.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function chunk(id,payload,flags=0){const pad=(4-payload.length%4)%4,b=Buffer.alloc(8+payload.length+pad);b.writeUInt32BE(((flags<<28)|b.length)>>>0);b.write(id,4,4,'ascii');payload.copy(b,8);return b;}
function convert(source,reference){
 const a=hkx(source),b=hkx(reference),ar=registry(a.types),br=registry(b.types),plans=new Map();
 const mapType=i=>i?br.byIdentity.get(ar.identity(i))?.index:0;
 for(let i=1;i<a.types.length;i++)assert(mapType(i),'missing target type '+ar.identity(i));
 function plan(i,stack=new Set()){
  if(plans.has(i))return plans.get(i);assert(!stack.has(i),'inline recursion');stack=new Set([...stack,i]);
  const t=ar.type(i),u=br.type(mapType(i));assert.equal(t.format,u.format,'format '+t.identity);assert.equal(ar.identity(t.subType),br.identity(u.subType),'subtype');
  let segments=[];
  if((t.format&15)===7){
   assert.equal(t.fields.length,u.fields.length,'field count '+t.identity);assert.equal(new Set(t.fields.map(f=>f.name)).size,t.fields.length,'duplicate field');
   for(const f of t.fields){const g=u.fields.find(x=>x.name===f.name);assert(g,'missing field '+f.name);assert.equal(f.flags,g.flags,'field flags');assert.equal(ar.identity(f.type),br.identity(g.type),'field identity');for(const s of plan(f.type,stack).segments)segments.push({old:f.offset+s.old,next:g.offset+s.next,length:s.length});}
  }else if((t.format&15)===8&&t.name==='T[N]'){
   const n=t.format>>>8,st=ar.type(t.subType),dt=br.type(u.subType);assert(n&&n*st.size===t.size&&n*dt.size===u.size,'fixed array size');for(let j=0;j<n;j++)for(const s of plan(t.subType,stack).segments)segments.push({old:j*st.size+s.old,next:j*dt.size+s.next,length:s.length});
  }else{assert.equal(t.size,u.size,'nonrecord size '+t.identity);assert.equal(t.alignment,u.alignment,'nonrecord alignment');segments=[{old:0,next:0,length:t.size}];}
  for(const key of ['old','next']){const sorted=[...segments].sort((x,y)=>x[key]-y[key]);let end=0;for(const s of sorted){assert(s.length>=0&&s[key]>=end,'overlapping fields '+t.identity);end=s[key]+s.length;assert(end<=(key==='old'?t.size:u.size),'field bounds '+t.identity);}}
  // Merge adjacent runs, while retaining only explicitly mapped bytes for changed layouts.
  segments.sort((x,y)=>x.old-y.old);const merged=[];for(const s of segments){const last=merged.at(-1);if(last&&last.old+last.length===s.old&&last.next+last.length===s.next)last.length+=s.length;else if(s.length)merged.push({...s});}
  const same=t.size===u.size&&merged.every(s=>s.old===s.next);
  const p={type:t,target:u,segments:same?[{old:0,next:0,length:t.size}]:merged,changed:!same};plans.set(i,p);return p;
 }
 const itemInfo=[];let newLength=0;const changedCounts={};
 for(const item of a.items){if(item.index===0){assert.equal(item.flags|item.offset|item.count,0);itemInfo.push({...item,nextOffset:0});continue;}assert(item.count>0);const p=plan(item.type);assert(item.offset+item.count*p.type.size<=a.data.length,'item source bounds');const align=Math.max(16,p.target.alignment);newLength=Math.ceil(newLength/align)*align;itemInfo.push({...item,nextOffset:newLength,plan:p});newLength+=item.count*p.target.size;if(p.changed)changedCounts[p.type.identity]=(changedCounts[p.type.identity]||0)+item.count;}
 const result=Buffer.alloc(newLength),relocations=new Int32Array(a.data.length).fill(-1),occupied=new Uint8Array(a.data.length);let discardedZeroBytes=0;
 for(const item of itemInfo.slice(1)){
  const p=item.plan;for(let n=0;n<item.count;n++){
   const old=item.offset+n*p.type.size,next=item.nextOffset+n*p.target.size;
   assert(!occupied.subarray(old,old+p.type.size).some(x=>x),'overlapping ITEM ranges');occupied.fill(1,old,old+p.type.size);
   for(const s of p.segments){a.data.copy(result,next+s.next,old+s.old,old+s.old+s.length);for(let j=0;j<s.length;j++)relocations[old+s.old+j]=next+s.next+j;}
   for(let j=0;j<p.type.size;j++)if(relocations[old+j]===-1){assert.equal(a.data[old+j],0,'nonzero discarded byte '+p.type.identity+' at '+j);discardedZeroBytes++;}
  }
 }
 for(let j=0;j<a.data.length;j++)if(!occupied[j])assert.equal(a.data[j],0,'nonzero gap outside items');
 const itemBytes=Buffer.alloc(a.items.length*12);for(const item of itemInfo){const at=item.index*12;itemBytes.writeUInt32LE(((item.flags&0xff000000)|mapType(item.type))>>>0,at);itemBytes.writeUInt32LE(item.nextOffset,at+4);itemBytes.writeUInt32LE(item.count,at+8);}
 const patchParts=[];let patchCount=0;
 for(const group of a.patches){const part=Buffer.alloc(8+group.offsets.length*4);part.writeUInt32LE(mapType(group.type),0);part.writeUInt32LE(group.offsets.length,4);
  const moved=group.offsets.map(offset=>{assert(offset<relocations.length);const next=relocations[offset];assert(next>=0,'patch points to removed byte');const width=ar.type(group.type).name==='hkRelArray'?4:8;assert(offset+width<=a.data.length&&next+width<=result.length);for(let j=0;j<width;j++)assert.equal(relocations[offset+j],next+j,'split patch pointer');const value=width===8?a.data.readBigUInt64LE(offset):BigInt(a.data.readUInt32LE(offset));assert(value>0n&&value<BigInt(a.items.length),'invalid item pointer');assert(a.data.subarray(offset,offset+width).equals(result.subarray(next,next+width)),'pointer changed');patchCount++;return next;}).sort((x,y)=>x-y);
  moved.forEach((offset,i)=>part.writeUInt32LE(offset,8+i*4));patchParts.push(part);
 }
 const sourceTop=a.tree[0],topParts=[];for(const s of sourceTop.children){if(s.id==='DATA')topParts.push(chunk('DATA',result,s.flags));else if(s.id==='TYPE'){const target=b.find('TYPE');topParts.push(reference.subarray(target.offset,target.offset+target.size));}else if(s.id==='INDX'){const ii=chunk('ITEM',itemBytes,a.find('ITEM').flags),pp=chunk('PTCH',Buffer.concat(patchParts),a.find('PTCH').flags);assert.deepEqual(s.children.map(x=>x.id),['ITEM','PTCH']);topParts.push(chunk('INDX',Buffer.concat([ii,pp]),s.flags));}else{assert(['SDKV'].includes(s.id),'unexpected top section '+s.id);topParts.push(source.subarray(s.offset,s.offset+s.size));}}
 const output=chunk('TAG0',Buffer.concat(topParts),sourceTop.flags),check=hkx(output);assert.equal(check.items.length,a.items.length);assert.equal(check.patches.reduce((n,p)=>n+p.offsets.length,0),patchCount);
 return {output,report:{sourceSha256:sha(source),referenceSha256:sha(reference),outputSha256:sha(output),sourceBytes:source.length,outputBytes:output.length,itemCount:a.items.length,patchCount,changedCounts,discardedZeroBytes,typeMappingCount:a.types.length-1}};
}
if(require.main===module){
 const mod=binder(fs.readFileSync('analysis-26.1/behavior-conversion/behavior.bnd')),ps4=binder(fs.readFileSync('analysis-26.1/ps4-1.17.1/chr/behavior.bnd')),out='analysis-26.1/behavior-conversion/experimental',reports=[];
 for(let i=0;i<mod.length;i++){const source=mod[i],reference=ps4.find(e=>normalize(e.name)===normalize(source.name));assert(reference);const {output,report}=convert(source.bytes,reference.bytes);const filename=path.join(out,String(i),path.win32.basename(source.name));fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,output);
  const restored=convert(output,source.bytes).output,aa=hkx(source.bytes),rr=hkx(restored),types=registry(aa.types);for(let j=1;j<aa.items.length;j++){const x=aa.items[j],y=rr.items[j];assert.equal(x.type,y.type);assert.equal(x.count,y.count);const length=types.type(x.type).size*x.count;assert(aa.data.subarray(x.offset,x.offset+length).equals(rr.data.subarray(y.offset,y.offset+length)),'roundtrip item '+j);}
  reports.push({member:source.name,filename,...report,roundTripAllItemBytesEqual:true});
 }
 fs.writeFileSync(path.join(out,'conversion-report.json'),JSON.stringify(reports,null,2));console.log(JSON.stringify(reports,null,2));
}
module.exports={convert};
