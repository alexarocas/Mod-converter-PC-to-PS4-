const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const {layout,transform}=require('./ps4-texture-blocks.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const formats=new Map([[28,[8,4,1]],[71,[0,8,4]],[72,[0,8,4]],[80,[103,8,4]],[98,[106,16,4]],[99,[112,16,4]]]);
const align=(n,a)=>Math.ceil(n/a)*a;
function convertTPF(b){
  assert.equal(b.toString('ascii',0,4),'TPF\0');assert.equal(b[12],0,'PC TPF only');
  assert.equal(b[14],1,'UTF16 required');assert.equal(b[13],3,'unknown header flag');
  const count=b.readUInt32LE(8),textures=[];let p=16;
  for(let i=0;i<count;i++,p+=20){
    const off=b.readUInt32LE(p),length=b.readUInt32LE(p+4),sourceFormat=b[p+8];
    assert.equal(b[p+9],0,'2D only');assert.equal(b[p+11],0,'texture flags');assert.equal(b.readUInt32LE(p+16),0,'float structure');
    const nameOffset=b.readUInt32LE(p+12);let end=nameOffset;
    while(end+2<=b.length&&b.readUInt16LE(end))end+=2;assert(end+2<=b.length);
    const name=b.toString('utf16le',nameOffset,end),dds=b.subarray(off,off+length);
    assert.equal(dds.length,length);assert.equal(dds.toString('ascii',0,4),'DDS ');
    assert.equal(dds.readUInt32LE(4),124);const width=dds.readUInt32LE(16),height=dds.readUInt32LE(12),mips=dds.readUInt32LE(28)||1;
    assert(width>0&&height>0&&width<=65535&&height<=65535);assert.equal(mips,b[p+10]);
    assert.equal(dds.readUInt32LE(112)&0xFE00,0,'cube/volume DDS unsupported');
    const four=dds.toString('ascii',84,88);let dxgi,start;
    if(four==='DX10'){
      dxgi=dds.readUInt32LE(128);start=148;assert.equal(dds.readUInt32LE(132),3,'2D DDS required');assert.equal(dds.readUInt32LE(140),1,'arrays unsupported');assert.equal(dds.readUInt32LE(136)&4,0,'cubemap');
    }else if(four==='ATI1'||four==='BC4U'){dxgi=80;start=128;}
    else if(four==='DXT1'){dxgi=71;start=128;}
    else if(dds.readUInt32LE(80)===0x41&&dds.readUInt32LE(88)===32&&dds.readUInt32LE(92)===0xff&&dds.readUInt32LE(96)===0xff00&&dds.readUInt32LE(100)===0xff0000&&dds.readUInt32LE(104)===0xff000000){dxgi=28;start=128;}
    else throw Error('unsupported DDS '+four);
    assert(formats.has(dxgi),'unsupported DXGI '+dxgi);const [format,blockBytes,pixelBlockSize]=formats.get(dxgi),spec=layout(width,height,mips,blockBytes,pixelBlockSize),linear=dds.subarray(start);
    assert.equal(linear.length,spec.linear,'DDS mip sizes '+name);const payload=transform(linear,spec,true);
    assert(transform(payload,spec,false).equals(linear),'BC roundtrip '+name);
    textures.push({name,width,height,mips,dxgi,format,sourceFormat,payload,linearSHA256:sha(linear)});
  }
  let cursor=16+count*36;
  for(const t of textures){t.nameOffset=cursor;t.nameBytes=Buffer.from(t.name+'\0','utf16le');cursor+=t.nameBytes.length;}
  const dataStart=align(cursor,16);cursor=dataStart;
  for(const t of textures){cursor=align(cursor,4);t.offset=cursor;cursor+=t.payload.length;}
  const out=Buffer.alloc(cursor);b.copy(out,0,0,16);out[12]=4;out.writeUInt32LE(cursor-dataStart,4);
  textures.forEach((t,i)=>{
    const h=16+i*36;out.writeUInt32LE(t.offset,h);out.writeUInt32LE(t.payload.length,h+4);out[h+8]=t.format;out[h+10]=t.mips;
    out.writeUInt16LE(t.width,h+12);out.writeUInt16LE(t.height,h+14);out.writeUInt32LE(1,h+16);out.writeUInt32LE(13,h+20);
    out.writeUInt32LE(t.nameOffset,h+24);out.writeUInt32LE(t.dxgi,h+32);t.nameBytes.copy(out,t.nameOffset);t.payload.copy(out,t.offset);
    // Re-read the output header and payload independently of the writer offsets.
    const offset=out.readUInt32LE(h),size=out.readUInt32LE(h+4);
    const parameters=formats.get(out.readUInt32LE(h+32)),spec=layout(out.readUInt16LE(h+12),out.readUInt16LE(h+14),out[h+10],parameters[1],parameters[2]);
    assert.equal(sha(transform(out.subarray(offset,offset+size),spec,false)),t.linearSHA256);
  });
  return {bytes:out,report:{inputSHA256:sha(b),outputSHA256:sha(out),inputBytes:b.length,outputBytes:out.length,textureCount:count,textures:textures.map(({payload,nameBytes,...t})=>({...t,tiledBytes:payload.length})),limitations:['No runtime PS4 validation','BC7 sRGB TPF format 112 based on source mapping, not direct PS4 sample','Only explicit supported 2D BC formats; other cases rejected']}};
}
module.exports={convertTPF};
if(require.main===module){
  const base='analysis-26.1/model-conversion/',out=base+'experimental';fs.mkdirSync(out,{recursive:true});
  const {bytes,report}=convertTPF(fs.readFileSync(base+'mod-members/WP_A_9925.tpf'));
  fs.writeFileSync(out+'/WP_A_9925.tpf',bytes);fs.writeFileSync(out+'/texture-conversion-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
