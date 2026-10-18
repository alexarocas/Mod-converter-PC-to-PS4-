const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict');
const root='analysis-26.1/model-conversion/experimental/',names=['wp_a_9925.partsbnd.dcx','wp_a_9925_l.partsbnd.dcx'];
const expected='883dca3e2fe76cf1361c800d298d6fe74b7d43500b13ee94921b0b3a8fe16737';
const files=names.map(name=>{const bytes=fs.readFileSync(root+'ftp-verificado/'+name),local=fs.readFileSync(root+name),sha256=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(bytes.length,37835692);assert.equal(sha256,expected);assert(bytes.equals(local));return {name,bytes:bytes.length,sha256,verified:true};});
const report={verifiedAtUTC:new Date().toISOString(),destination:'/data/GoldHEN/AFR/CUSA18723/parts/',files,runtimeTested:false};fs.writeFileSync(root+'ftp-verificado/deployment.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
