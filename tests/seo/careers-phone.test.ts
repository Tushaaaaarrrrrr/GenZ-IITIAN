import {it,expect} from 'vitest';
import fs from 'node:fs';
import vm from 'node:vm';
import handler from '../../api/job-applications';
function response(){return {code:200,body:null as any,status(code:number){this.code=code;return this;},json(body:any){this.body=body;return this;}};}
const request={method:'POST',headers:{},body:{full_name:'Test Applicant',email:'test@example.com',phone:'+91 98765 43210',age:20}};
it('standalone careers API saves the validated phone without a reference error',async()=>{
 const names=['VITE_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','VITE_SUPABASE_ANON_KEY'];const previous=names.map(key=>process.env[key]);
 try{names.forEach(key=>delete process.env[key]);const res=response();await handler(request,res);expect(res.code).toBe(200);expect(res.body.application.phone).toBe('9876543210');}
 finally{names.forEach((key,i)=>{if(previous[i]===undefined)delete process.env[key];else process.env[key]=previous[i];});}
});
it('Express careers API saves the same validated phone',async()=>{
 const source=fs.readFileSync('server/index.js','utf8');const start=source.indexOf("app.post('/api/job-applications',");const end=source.indexOf("app.get('/api/job-applications',",start);let submit:any;
 vm.runInNewContext(source.slice(start,end),{app:{post(_path:string,fn:any){submit=fn;}},supabase:null,memoryJobApplications:new Map(),saveApplicationsToFile(){},console:{log(){},warn(){},error(){}}});
 const res=response();await submit(request,res);expect(res.code).toBe(200);expect(res.body.application.phone).toBe('9876543210');
});
