import {it,expect} from 'vitest';
import {spawn} from 'node:child_process';
const instrument=`const http=require('node:http');const original=http.Server.prototype.listen;http.Server.prototype.listen=function(...args){this.once('listening',()=>console.log('SEO_STARTUP_PORT='+this.address().port));return original.apply(this,args);};`;
for(const launcher of ['require','import']) it(`starts through ${launcher} without top-level-await incompatibility`,async()=>{
 const env={...process.env,PORT:'0'};
 for(const key of ['VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','WELCOME_WEBHOOK_URL','RAZORPAY_SECRET','VITE_RAZORPAY_KEY_ID','SEO_STAGING'])delete (env as any)[key];
 const child=spawn(process.execPath,['-e',instrument+(launcher==='require'?`require('./server/index.js');`:`import('./server/index.js').catch(e=>{console.error(e);process.exit(1)});`)],{cwd:process.cwd(),env,stdio:['ignore','pipe','pipe']});
 let output='';let errors='';child.stderr.on('data',data=>errors+=data);
 try{
  const port=await new Promise<number>((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('Server startup timeout: '+errors)),8000);
   child.stdout.on('data',data=>{output+=data;const m=output.match(/SEO_STARTUP_PORT=(\d+)/);if(m){clearTimeout(timer);resolve(Number(m[1]));}});
   child.once('error',e=>{clearTimeout(timer);reject(e);});child.once('exit',code=>{clearTimeout(timer);reject(new Error(`Startup exited ${code}: ${errors}`));});
  });
  const res=await fetch(`http://127.0.0.1:${port}/robots.txt`);expect(res.status).toBe(200);expect(await res.text()).toContain('Sitemap: https://genziitian.in/sitemap.xml');expect(errors).not.toContain('ERR_REQUIRE_ASYNC_MODULE');
 }finally{child.kill('SIGTERM');await new Promise<void>(resolve=>child.exitCode!==null?resolve():child.once('exit',()=>resolve()));}
},12000);
