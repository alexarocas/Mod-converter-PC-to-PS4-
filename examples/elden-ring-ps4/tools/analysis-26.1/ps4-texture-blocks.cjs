// BC payload tiling only. No decompression/recompression of color blocks.
const assert=require('assert');
function layout(width,height,mips,blockBytes,pixelBlockSize=4){
  assert([4,8,16].includes(blockBytes));assert([1,4].includes(pixelBlockSize)); const levels=[];let linear=0,tiled=0;
  for(let i=0;i<mips;i++){
    const x=Math.max(1,Math.ceil(width/pixelBlockSize)),y=Math.max(1,Math.ceil(height/pixelBlockSize));
    const tx=Math.ceil(x/8),ty=Math.ceil(y/8),size=x*y*blockBytes,padded=tx*ty*64*blockBytes;
    levels.push({width,height,x,y,tx,ty,linear,tiled,size,padded});linear+=size;tiled+=padded;
    width=Math.max(1,Math.floor(width/2));height=Math.max(1,Math.floor(height/2));
  }return {levels,linear,tiled,blockBytes};
}
function transform(input,spec,toTiled){
  assert.equal(input.length,toTiled?spec.linear:spec.tiled,'payload length');
  const out=Buffer.alloc(toTiled?spec.tiled:spec.linear),n=spec.blockBytes;
  for(const l of spec.levels)for(let ty=0;ty<l.ty;ty++)for(let tx=0;tx<l.tx;tx++)for(let m=0;m<64;m++){
    const x=tx*8+(m&1)+((m>>1)&2)+((m>>2)&4);
    const y=ty*8+((m>>1)&1)+((m>>2)&2)+((m>>3)&4);
    if(x>=l.x||y>=l.y)continue;
    const a=l.linear+(y*l.x+x)*n,b=l.tiled+((ty*l.tx+tx)*64+m)*n;
    input.copy(out,toTiled?b:a,toTiled?a:b,(toTiled?a:b)+n);
  }return out;
}
module.exports={layout,transform};
if(require.main===module){
  const fs=require('fs'),crypto=require('crypto');
  const base='analysis-26.1/model-conversion/',meta=JSON.parse(fs.readFileSync(base+'ps4-textures.json'));
  const tpf=fs.readFileSync(base+'ps4-members/WP_A_0550.tpf');const results=[];
  for(const t of meta.list){
    const s=layout(t.width,t.height,t.mips,[71,72,80,81].includes(t.dxgi)?8:16);
    const original=tpf.subarray(t.offset,t.offset+t.length);assert.equal(s.tiled,original.length);
    const linear=transform(original,s,false),back=transform(linear,s,true);
    let differences=0;for(let i=0;i<back.length;i++)if(back[i]!==original[i])differences++;
    results.push({name:t.name,dxgi:t.dxgi,linearBytes:s.linear,tiledBytes:s.tiled,roundtripExact:back.equals(original),paddingDifferences:differences,linearSHA256:crypto.createHash('sha256').update(linear).digest('hex')});
    assert(back.equals(original),'nonzero padding or incompatible tiling');
  }
  // Inverse alone cannot establish the GPU tiling convention. This checks sizes,
  // preservation and padding; convention is based separately on source review.
  const report={scope:'BC block layout, sizes and byte preservation; no runtime validation',results};
  fs.writeFileSync(base+'texture-block-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
