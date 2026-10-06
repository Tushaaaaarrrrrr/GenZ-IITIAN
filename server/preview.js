// Read-only public preview: deliberately excludes payment, email and enrolment code.
import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createPublicHttp} from './public/http.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dev=process.argv.includes('--dev');
let repository,client;
if(process.env.SEO_FIXTURE==='true') {repository=(await import('../tests/seo/fixtures.js')).fixtureRepository();}
else {client=(await import('./supabase.js')).supabase;}
const http=await createPublicHttp({root,client,repository,dev});
const app=express();app.use(http.early);app.use(http.api);
if(dev && !repository) app.use('/api',express.raw({type:'*/*',limit:'5mb'}),async(req,res)=>{
  try {
    const headers={};for(const [key,value] of Object.entries(req.headers))if(!['host','connection','content-length'].includes(key)&&typeof value==='string')headers[key]=value;
    const upstream=await fetch((process.env.API_PROXY_TARGET||'http://127.0.0.1:3001')+req.originalUrl,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:req.body}:{}),redirect:'manual'});
    res.status(upstream.status);for(const [key,value] of upstream.headers)if(!['content-encoding','content-length','transfer-encoding'].includes(key))res.setHeader(key,value);
    res.send(Buffer.from(await upstream.arrayBuffer()));
  }catch{res.status(503).json({error:'Start the existing Express API on port 3001 for application actions.'});}
});
if(http.assets)app.use(http.assets);else app.use(express.static(path.join(root,'dist'),{index:false}));
app.use(http.document);
const server=app.listen(process.env.PORT||3100,'127.0.0.1',()=>console.log('Public preview http://127.0.0.1:'+(process.env.PORT||3100)));
process.on('SIGTERM',()=>{server.close();http.close();});
