const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {binder,hkx,registry}=require('./hkx-layout.cjs');
const {convert}=require('./convert-behavior.cjs');
const {graph}=require('./verify-behavior-graph.cjs');
const {sourceType,replaceType,compendia,makeNativeSchemaBuilder}=require('./animation-schema.cjs');
function convertMember(m,comps,build){
  const type=sourceType(m.bytes,comps),native=build(type),source=replaceType(m.bytes,type),reference=replaceType(m.bytes,native.typeBytes),result=convert(source,reference),dest=result.output;
  const a=graph(source),b=graph(dest);assert.deepEqual(a.items,b.items);assert.equal(a.patches.size,b.patches.size);for(const [k,v]of a.patches)assert.equal(b.patches.get(k),v);
  const inverse=convert(dest,source).output,orig=hkx(source),back=hkx(inverse),r=registry(orig.types);
  for(let i=1;i<orig.items.length;i++){const x=orig.items[i],y=back.items[i],n=x.count*r.type(x.type).size;assert.equal(x.type,y.type);assert.equal(x.count,y.count);assert(orig.data.subarray(x.offset,x.offset+n).equals(back.data.subarray(y.offset,y.offset+n)));}
  const unknown=new Set(native.unknownTypes.map(t=>t.identity)),instantiatedUnknown=[...new Set(orig.items.slice(1).map(x=>r.identity(x.type)).filter(x=>unknown.has(x)))];
  return {bytes:dest,detail:{sourceBytes:m.bytes.length,outputBytes:dest.length,instantiatedUnknown,unverifiedTypeHashes:native.unverifiedHashes,roundtripItemBytes:true,semanticGraphEqual:true}};
}
module.exports={convertMember};
if(require.main===module){
const base='analysis-26.1/model-conversion/',build=makeNativeSchemaBuilder(),reports=[];
for(const name of fs.readdirSync(base+'mod-members').filter(n=>n.endsWith('.anibnd'))){
 const members=binder(fs.readFileSync(base+'mod-members/'+name)),comps=compendia(members),out=base+'experimental/'+name+'.members';fs.mkdirSync(out,{recursive:true});const converted=[];
 for(const m of members){
  if(m.name.endsWith('.compendium'))continue; // All converted HKX below carry TYPE.
  assert(m.name.endsWith('.hkx'));const {bytes:dest,detail}=convertMember(m,comps,build);
  const filename=path.join(out,path.win32.basename(m.name));fs.writeFileSync(filename,dest);converted.push({name:m.name.replace('INTERROOT_win64','INTERROOT_ps4'),id:m.id,filename,...detail});
 }
 reports.push({name,members:converted,compendiumRemovedBecauseStandalone:true});
}
fs.writeFileSync(base+'experimental/weapon-animation-conversion.json',JSON.stringify(reports,null,2));console.log(JSON.stringify(reports.map(r=>({name:r.name,hkx:r.members.length,unknownFiles:r.members.filter(m=>m.instantiatedUnknown.length).length})),null,2));
}
