const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {binder,hkx,registry,sections,flat}=require('./hkx-layout.cjs');
const {convert}=require('./convert-behavior.cjs'),{graph}=require('./verify-behavior-graph.cjs');
const {chunk,replaceType,sourceType,compendia,makeNativeSchemaBuilder}=require('./animation-schema.cjs');
const base='analysis-26.1/animation-conversion',out=path.join(base,'experimental');fs.mkdirSync(out,{recursive:true});
const buildNative=makeNativeSchemaBuilder(),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const names=['c0000.anibnd.dcx','c0000_a00_hi.anibnd.dcx','c0000_a6x.anibnd.dcx'],report=[];
for(const name of names){
 const members=binder(fs.readFileSync(path.join(base,'mod-'+name+'.bnd'))),comps=compendia(members),converted=[],details=[];let count=0;
 for(const m of members){
  let bytes=m.bytes,detail={sourceName:m.name,id:m.id,sourceLength:m.size,sourceSha256:sha(bytes)};
  if(m.name.endsWith('.hkx')){
   const type=sourceType(bytes,comps),native=buildNative(type),selfContained=replaceType(bytes,type),reference=replaceType(bytes,native.typeBytes),convertedFile=convert(selfContained,reference),destination=convertedFile.output;
   const originalGraph=graph(selfContained),newGraph=graph(destination);assert.deepEqual(originalGraph.items,newGraph.items,'ITEM schema');assert.equal(originalGraph.patches.size,newGraph.patches.size);for(const [key,value]of originalGraph.patches)assert.equal(newGraph.patches.get(key),value,'Semantic pointer graph');
   const restored=convert(destination,selfContained).output,a=hkx(selfContained),b=hkx(restored),r=registry(a.types);for(let j=1;j<a.items.length;j++){const x=a.items[j],y=b.items[j],length=r.type(x.type).size*x.count;assert.equal(x.type,y.type);assert.equal(x.count,y.count);assert(a.data.subarray(x.offset,x.offset+length).equals(b.data.subarray(y.offset,y.offset+length)),'Inverse item bytes '+m.name+' #'+j);}
   const unknown=new Set(native.unknownTypes.map(t=>t.identity)),instantiatedUnknown=[...new Set(a.items.slice(1).map(i=>r.identity(i.type)).filter(k=>unknown.has(k)))];
   if(name==='c0000.anibnd.dcx'){assert.equal(Object.keys(convertedFile.report.changedCounts).length,0,'Skeleton has changed instantiated layout');bytes=m.bytes;detail.skeletonKeptUnchanged=true;}
   else bytes=destination;
   detail={...detail,...convertedFile.report,sourceSha256:sha(m.bytes),outputSha256:sha(bytes),outputLength:bytes.length,standaloneType:!detail.skeletonKeptUnchanged,sourceTypeSha256:native.sourceTypeSha256,targetTypeSha256:native.targetTypeSha256,inferredInstantiatedTypes:instantiatedUnknown,unverifiedTypeHashes:native.unverifiedHashes,roundTripAllItemBytesEqual:true,identicalSemanticPointerGraph:true};
   count++;if(count%100===0)console.log(name+': '+count+' HKX verificados');
  }else if(m.name.endsWith('.compendium')){const tree=sections(bytes)[0],type=sourceTypeForCompendium(bytes),native=buildNative(type);bytes=chunk('TCM0',Buffer.concat(tree.children.map(s=>s.id==='TYPE'?native.typeBytes:m.bytes.subarray(s.offset,s.offset+s.size))),tree.flags);detail.compendiumMetadataAdapted=true;}
  const relative=m.name.replace(/^[A-Za-z]:[\\/]/,'').split(/[\\/]+/).filter(Boolean);assert(!relative.includes('..'));const filename=path.join(out,name,'members',...relative);fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,bytes);converted.push({id:m.id,name:m.name.replace('INTERROOT_win64','INTERROOT_ps4'),filename,size:bytes.length,sha256:sha(bytes)});details.push(detail);
 }
 const manifest={name,experimental:true,consoleTested:false,hkxCount:count,members:converted,details};fs.writeFileSync(path.join(out,name,'manifest.json'),JSON.stringify(manifest,null,2));report.push({name,hkxCount:count,members:members.length,inferredFiles:details.filter(d=>d.inferredInstantiatedTypes?.length).length,inferredTypes:[...new Set(details.flatMap(d=>d.inferredInstantiatedTypes||[]))]});console.log('Terminado '+JSON.stringify(report.at(-1)));
}
fs.writeFileSync(path.join(out,'conversion-summary.json'),JSON.stringify(report,null,2));
function sourceTypeForCompendium(bytes){const t=flat(sections(bytes)).find(s=>s.id==='TYPE');assert(t);return bytes.subarray(t.offset,t.offset+t.size);}
