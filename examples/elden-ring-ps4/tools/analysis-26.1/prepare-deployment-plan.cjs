const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
const root='analysis-26.1/asset-conversion/',rows=JSON.parse(fs.readFileSync(root+'compression-report.json','utf8').replace(/^\uFEFF/,''));
assert.equal(rows.length,56,'Expected 50 parts + 2 SFX + 3 auxiliary + Spanish');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),existing=new Set(['parts/wp_a_9925.partsbnd.dcx','parts/wp_a_9925_l.partsbnd.dcx']),files=[];
for(const r of rows){
 const bytes=fs.readFileSync(r.filename);assert.equal(bytes.length,r.bytes);assert.equal(sha(bytes),r.sha256);assert(r.decompressionEqual);const remotePath=r.path.toLowerCase();
 if(existing.has(remotePath)){assert.equal(r.sha256,'883dca3e2fe76cf1361c800d298d6fe74b7d43500b13ee94921b0b3a8fe16737','Tested weapon changed');continue;}
 files.push({...r,sourcePath:r.path,path:remotePath,requiresSourceAnomalyReview:r.status==='prepared_with_source_warnings'});
}
assert.equal(new Set(files.map(f=>f.path)).size,files.length);assert.equal(files.length,54);
const plan={consoleRoot:'/data/GoldHEN/AFR/CUSA18723/',deployed:false,files,bytes:files.reduce((n,f)=>n+f.bytes,0),sourceWarningFiles:files.filter(f=>f.requiresSourceAnomalyReview).map(f=>f.path),notes:['No upload authorization for this batch yet','Lowercase remote paths, including WP_A_9930 source names','10 files retain binding anomalies proved identical before and after conversion','Spanish keeps original text and overlays 170 mod changes in English','Geometry/shader parameters and runtime not fully validated; staged testing required']};
fs.writeFileSync(root+'deployment-plan.json',JSON.stringify(plan,null,2));
const categories={};for(const f of files){const k=f.path.split('/')[0];categories[k]??={files:0,bytes:0};categories[k].files++;categories[k].bytes+=f.bytes;}
const summary={files:files.length,MiB:plan.bytes/1048576,categories,sourceWarningFiles:plan.sourceWarningFiles,roughUploadMinutesAt150KBps:Math.ceil(plan.bytes/150000/60)};
fs.writeFileSync(root+'deployment-summary.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
