const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const parseTypes=require('../analysis-ps4/task-017/types.cjs');
function sections(b,start=0,end=b.length){
 const result=[];for(let p=start;p<end;){assert(p+8<=end,'section header');const word=b.readUInt32BE(p),size=word&0x0fffffff,id=b.toString('ascii',p+4,p+8);assert(size>=8&&p+size<=end,'section bounds');const s={id,offset:p,size,flags:word>>>28};if(['TAG0','TYPE','INDX','TCM0'].includes(id))s.children=sections(b,p+8,p+size);result.push(s);p+=size;}return result;
}
const flat=ss=>ss.flatMap(s=>[s,...flat(s.children||[])]);
function hkx(b){
 const tree=sections(b),all=flat(tree),find=id=>all.find(s=>s.id===id),types=parseTypes(b,all);assert.equal(tree[0].id,'TAG0');assert(types,'local TYPE required');
 const itemSection=find('ITEM'),data=find('DATA'),patch=find('PTCH');assert(itemSection&&data&&patch);assert.equal((itemSection.size-8)%12,0);
 const items=[];for(let p=itemSection.offset+8;p<itemSection.offset+itemSection.size;p+=12){const flags=b.readUInt32LE(p),type=flags&0xffffff,offset=b.readUInt32LE(p+4),count=b.readUInt32LE(p+8);items.push({index:items.length,flags,type,offset,count});}
 const patches=[];for(let p=patch.offset+8;p<patch.offset+patch.size;){assert(p+8<=patch.offset+patch.size);const type=b.readUInt32LE(p),count=b.readUInt32LE(p+4);p+=8;assert(p+count*4<=patch.offset+patch.size);const offsets=[];for(let i=0;i<count;i++,p+=4)offsets.push(b.readUInt32LE(p));patches.push({type,offsets});}
 return {b,tree,all,find,types,items,patches,data:b.subarray(data.offset+8,data.offset+data.size)};
}
function registry(types){
 const identities=new Map(),effective=new Map();
 function identity(i,seen=new Set()) {if(!i)return 'NULL';if(identities.has(i))return identities.get(i);assert(!seen.has(i),'template cycle');const t=types[i];assert(t,'missing type');seen=new Set([...seen,i]);const k=t.name+(t.parameters.length?'<'+t.parameters.map(p=>p.name+'='+ (p.name[0]==='t'?identity(p.value,seen):p.value)).join(',')+'>':'');identities.set(i,k);return k;}
 function type(i){if(!i)return null;if(effective.has(i))return effective.get(i);const t=types[i],parent=type(t.parent);const result={...t,identity:identity(i),size:t.size??parent?.size??0,alignment:t.alignment??parent?.alignment??1,format:t.format??parent?.format??0,subType:t.subType??parent?.subType??0,flags:t.flags??0,fields:[...(parent?.fields||[]),...(t.fields||[])]};effective.set(i,result);return result;}
 const byIdentity=new Map();for(let i=1;i<types.length;i++){const t=type(i);assert(!byIdentity.has(t.identity),'duplicate type identity '+t.identity);byIdentity.set(t.identity,t);}
 return {types,identity,type,byIdentity};
}
function binder(raw){const ctx={require,Buffer,__dirname:__dirname};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.resolve('analysis-26.0/analyze-mod.cjs'),'utf8').split('const inputs=')[0]+';globalThis.bind=binder;',ctx);return ctx.bind(raw).files.map(e=>({...e,bytes:raw.subarray(e.offset,e.offset+e.size)}));}
function normalize(n){return n.replace(/INTERROOT_(ps4|win64)/,'INTERROOT_PLATFORM');}
module.exports={sections,flat,hkx,registry,binder,normalize};
