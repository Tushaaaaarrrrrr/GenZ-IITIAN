// Read-only production inventory. No drafts or private content are exported.
import fs from 'node:fs/promises';
import {supabase} from '../server/supabase.js';
import {createPublicRepository} from '../server/public/content.js';
if(!supabase)throw new Error('Configure service credentials on the deployment host.');
const repo=createPublicRepository(supabase);
const [blogs,knowledge,resources]=await Promise.all([repo.blogs(),repo.allKnowledge(),repo.resources()]);
const normal=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const pages=[...blogs.map(b=>({url:'/blog/'+b.slug,title:b.title,kind:'blog'})),...knowledge.map(k=>({url:'/'+k.slug,title:k.title,kind:'knowledge'}))];
const duplicateTitles=pages.filter((p,i)=>pages.some((other,j)=>i!==j&&normal(p.title)===normal(other.title)));
await fs.mkdir('review',{recursive:true});await fs.writeFile('review/public-inventory.json',JSON.stringify({generated_at:new Date().toISOString(),pages,resources:resources.map(r=>({level:r.level,subject:r.subject,type:r.resource_type,url:r.url})),duplicateTitles},null,2));
console.log(`Audited ${blogs.length} blogs, ${knowledge.length} knowledge pages and ${resources.length} published resources. ${duplicateTitles.length} duplicate-title candidates. No changes made.`);
