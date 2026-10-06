import fs from 'node:fs/promises';
import {supabase} from '../server/supabase.js';
import {publicBlog} from '../server/public/content.js';
if(!supabase)throw new Error('Configure Supabase service credentials on the deployment host.');
const seed=JSON.parse(await fs.readFile(new URL('../content/editorial-guides.json',import.meta.url),'utf8'));
const now=new Date().toISOString();
// Existing slugs, including unpublished ones, are deliberately not overwritten or republished.
const rows=seed.map(row=>({...publicBlog(row),id:undefined,created_at:undefined,updated_at:undefined,published_at:now,modified_at:null,date:now.slice(0,10)}));
const {error}=await supabase.from('blogs').upsert(rows,{onConflict:'slug',ignoreDuplicates:true});
if(error)throw error;
const {data,error:verifyError}=await supabase.from('blogs').select('slug,published').in('slug',seed.map(p=>p.slug));
if(verifyError)throw verifyError;
for(const row of data||[])console.log(`${row.slug}: ${row.published===1?'published':'existing draft retained'}`);
