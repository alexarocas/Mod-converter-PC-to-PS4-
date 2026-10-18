const fs=require('fs'),assert=require('assert/strict');
const {hkx,registry}=require('./hkx-layout.cjs');
const root='analysis-26.1/model-conversion/experimental/';
function access(bytes){const h=hkx(bytes),r=registry(h.types);function field(item,name){const f=r.type(item.type).fields.find(f=>f.name===name);assert(f,'missing '+name);return item.offset+f.offset;}function ptr(item,name){const i=Number(h.data.readBigUInt64LE(field(item,name)));assert(i>=0&&i<h.items.length);return i?h.items[i]:null;}return {h,r,field,ptr};}
function verifyGroups(groups){const report=[];for(const group of groups){
 const sk=group.members.find(m=>/skeleton[^\\/]*\.hkx$/i.test(m.name));assert(sk,'No skeleton in '+group.name);const s=access(sk.bytes||fs.readFileSync(sk.filename));
 const skeletons=s.h.items.filter(i=>i.type&&s.r.type(i.type).name==='hkaSkeleton');assert.equal(skeletons.length,1);const bones=s.ptr(skeletons[0],'bones'),slots=s.ptr(skeletons[0],'floatSlots'),boneCount=bones?.count||0,floatSlots=slots?.count||0;assert(boneCount>0);
 const result={name:group.name,boneCount,floatSlots,bindings:0,highestBoneIndex:-1,issues:[]};
 for(const m of group.members){const {h,r,field,ptr}=access(m.bytes||fs.readFileSync(m.filename));for(const b of h.items.filter(i=>i.type&&r.type(i.type).name==='hkaAnimationBinding')){
  result.bindings++;const a=ptr(b,'animation');assert(a);const tracks=ptr(b,'transformTrackToBoneIndices'),floats=ptr(b,'floatTrackToFloatSlotIndices');const n=h.data.readInt32LE(field(a,'numberOfTransformTracks')),nf=h.data.readInt32LE(field(a,'numberOfFloatTracks'));
  if(tracks){if(tracks.count!==n)result.issues.push({file:m.name,issue:'track length',n,count:tracks.count});for(let i=0;i<tracks.count;i++){const index=h.data.readInt16LE(tracks.offset+i*2);result.highestBoneIndex=Math.max(result.highestBoneIndex,index);if(index< -1||index>=boneCount)result.issues.push({file:m.name,issue:'bone index',index});}}else if(n>boneCount)result.issues.push({file:m.name,issue:'implicit bone count',n});
  if(floats){if(floats.count!==nf)result.issues.push({file:m.name,issue:'float track length'});for(let i=0;i<floats.count;i++){const index=h.data.readInt16LE(floats.offset+i*2);if(index< -1||index>=floatSlots)result.issues.push({file:m.name,issue:'float index',index});}}else if(nf>floatSlots)result.issues.push({file:m.name,issue:'implicit float count',nf});
 }}report.push(result);
}return report;}
module.exports={verifyGroups};
if(require.main===module){const groups=JSON.parse(fs.readFileSync(root+'weapon-animation-conversion.json')),report=verifyGroups(groups);fs.writeFileSync(root+'weapon-binding-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert(report.every(r=>r.issues.length===0),'binding issues');}
