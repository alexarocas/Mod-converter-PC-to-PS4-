const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {hkx,registry}=require('./hkx-layout.cjs');
const base='analysis-26.1/animation-conversion/experimental',report={skeletonBones:150,files:0,bindings:0,highestBoneIndex:-1,issues:[],skeletonNames:{}};
for(const name of ['c0000_a00_hi.anibnd.dcx','c0000_a6x.anibnd.dcx']){const manifest=JSON.parse(fs.readFileSync(path.join(base,name,'manifest.json'),'utf8'));for(const member of manifest.members.filter(m=>m.name.endsWith('.hkx'))){const h=hkx(fs.readFileSync(member.filename)),r=registry(h.types);report.files++;
 function field(item,name){const f=r.type(item.type).fields.find(f=>f.name===name);assert(f,'Missing binding field '+name);return item.offset+f.offset;}
 function pointer(item,name){const p=Number(h.data.readBigUInt64LE(field(item,name)));assert(p>=0&&p<h.items.length);return p?h.items[p]:null;}
 for(const binding of h.items.filter(i=>i.type&&r.type(i.type).name==='hkaAnimationBinding')){assert.equal(binding.count,1);report.bindings++;const animation=pointer(binding,'animation'),tracks=pointer(binding,'transformTrackToBoneIndices'),floats=pointer(binding,'floatTrackToFloatSlotIndices'),skeleton=pointer(binding,'originalSkeletonName');if(skeleton){const value=h.data.subarray(skeleton.offset,skeleton.offset+skeleton.count).toString('utf8').replace(/\0+$/,'');report.skeletonNames[value]=(report.skeletonNames[value]||0)+1;}
 if(!animation){report.issues.push({file:member.name,issue:'No animation in binding'});continue;}const count=h.data.readInt32LE(field(animation,'numberOfTransformTracks')),floatCount=h.data.readInt32LE(field(animation,'numberOfFloatTracks'));if(tracks&&tracks.count!==count)report.issues.push({file:member.name,issue:'Track map length mismatch',count,mapCount:tracks.count});if(!tracks&&count>150)report.issues.push({file:member.name,issue:'Implicit track count exceeds skeleton bones',count});
 if(tracks)for(let j=0;j<tracks.count;j++){const index=h.data.readInt16LE(tracks.offset+j*2);report.highestBoneIndex=Math.max(report.highestBoneIndex,index);if(index< -1||index>=150)report.issues.push({file:member.name,issue:'Bone index outside skeleton',index});}
 if(floatCount!==0||(floats&&floats.count))report.issues.push({file:member.name,issue:'Float tracks with zero-slot skeleton',floatCount,floatMapCount:floats?.count||0});
 }
}}
fs.writeFileSync(path.join(base,'binding-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
