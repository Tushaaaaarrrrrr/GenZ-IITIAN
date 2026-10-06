import fs from 'node:fs';
import {publicBlog} from '../../server/public/content.js';
export const guides=JSON.parse(fs.readFileSync(new URL('../../content/editorial-guides.json',import.meta.url),'utf8')).map((b,i)=>publicBlog({...b,id:i+1,published_at:'2026-10-06T00:00:00Z'}));
export function fixtureRepository(overrides={}) {
 const pages=[{slug:'guide/test-knowledge',title:'A published learning guide',meta_description:'A published test document',published:true,sections:[{heading:'Learn safely',body:'<p>Meaningful knowledge content.</p>'}],faq:[],introduction:'<p>Published introduction.</p>',updated_at:'2026-10-06T00:00:00Z'}];
 return {
  blogs:async()=>guides,blog:async slug=>guides.find(b=>b.slug===slug||String(b.id)===slug)||null,
  resources:async filters=>[{id:'published-note',level:'Foundation',subject:'CT',resource_type:'note',sub_type:'Notes',title:'Published CT note',description:'Study safely.',url:'https://example.org/published-note',updated_at:'2026-10-06T00:00:00Z'}].filter(r=>!filters||(!filters.level||r.level===filters.level)&&(!filters.subject||r.subject===filters.subject)&&(!filters.type||r.resource_type===filters.type)),
  knowledge:async slug=>pages.find(p=>p.slug===slug)||null,allKnowledge:async()=>pages,related:async()=>[],
  knowledgeList:async()=>({pages,pagination:{page:1,totalPages:1,total:1}}),clusters:async()=>[],settings:async()=>({}),courses:async()=>[{id:'campaign-course'}],...overrides
 };
}
