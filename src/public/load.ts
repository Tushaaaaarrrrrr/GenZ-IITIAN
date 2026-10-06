import {catalogue,findSubject,resourcePath,assignmentBase,assignmentPath,BRAND,migrateResourceLink} from './catalogue';
import {descriptor,orgId} from './metadata';
import {youtubeEmbed} from './video';
import {staticNotes} from '../data/staticNotes';
import {gradedAssignments} from '../data/gradedAssignments';
import {assignmentReviews,approvedWeeks} from './assignment-review';
import {docsData} from '../data/docsData';
import type {PublicData,Resource} from './types';
import {sanitize,safeUrl} from '../../server/public/content.js';
const updateLinks=(html:string)=>html.replace(/href="([^"]+)"/g,(_,url)=>`href="${migrateResourceLink(url.replace(/&amp;/g,'&')).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"`);
const home={name:'Home',path:'/'}; const hub={name:'IITM BS',path:'/iitm-bs'};
const validDate=(v:unknown) => typeof v==='string' && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString():undefined;
export const mergedResources = (records:Resource[], level?:string, subject?:string, type?:string):Resource[] => [...new Map([
  ...staticNotes.filter(r=>(!level||r.level===level)&&(!subject||r.subject===subject)&&(!type||r.resource_type===type)),...records,
].filter(r=>safeUrl(r.url)).map(r=>[`${r.level}|${r.subject}|${r.url}`,r])).values()];
export function unavailable(path:string,status=404):PublicData { const title=status===503?'Content temporarily unavailable':'Page not found'; return {kind:'error',path,status,seo:descriptor({path,title:/Gen[- ]?Z?\s*IITian\s*$/i.test(title)?title:`${title} | ${BRAND}`,description:status===503?'Please try again shortly.':'This page is not available.',noindex:true})}; }
const itemList=(items:{title:string;path:string}[])=>[{'@type':'ItemList',itemListElement:items.map((x,i)=>({'@type':'ListItem',position:i+1,name:x.title,url:x.path.startsWith('/')?'https://genziitian.in'+x.path:x.path}))}];
export async function loadPublic(url:URL,repo:any):Promise<PublicData> {
  const path=url.pathname; const defaults=await repo.settings(); const defaultImage=safeUrl(defaults.site_image)||undefined; const data:PublicData={kind:'hub',status:200,path,query:url.search,seo:descriptor({path,title:'IITM BS Degree guides and learning resources | GenZ IITian',description:'Independent IITM BS degree guides, subject resources and archived assignment explanations.',image:defaultImage,breadcrumbs:[home,hub]})};
  const filters=[...url.searchParams.keys()].some(k=>!['page','ref','gclid','fbclid','msclkid'].includes(k)&&!k.startsWith('utm_'));
  const set=(kind:string,title:string,description:string,crumbs:any[]=[],noindex=filters,schema:any[]=[])=>{
    data.kind=kind;data.seo=descriptor({path:((kind==='blogs'||kind==='knowledge-directory')&&data.pagination&&data.pagination.page>1)?`${path}?page=${data.pagination.page}`:path,title:/Gen[- ]?Z?\s*IITian\s*$/i.test(title)?title:`${title} | ${BRAND}`,description,breadcrumbs:[home,...crumbs],noindex,schema,image:defaultImage});
  };
  if(path==='/') { set('home','IITM BS Degree learning resources and guidance','Explore independent IITM BS guides, notes, past questions and mentorship from GenZ IITian.'); data.blogs=(await repo.blogs()).slice(0,4);return data; }
  if(path==='/iitm-bs') return data;
  if(path==='/about') {set('about','About GenZ IITian','Learn about the independent GenZ IITian learning community and our support for IITM BS students.',[{name:'About',path}]);return data;}
  if(path==='/contact') {set('contact','Contact GenZ IITian','Contact GenZ IITian support about learning resources, courses and the student community.',[{name:'Contact',path}]);return data;}
  if(path==='/iitm-bs/resources') {
    data.resources=mergedResources(await repo.resources());
    const available=catalogue.flatMap(l=>l.subjects.filter(s=>data.resources!.some(r=>r.level===l.key&&r.subject===s.key)).map(s=>({title:`${l.key}: ${s.name}`,path:resourcePath(l.key,s.key)!})));
    set('resources','IITM BS resources: notes, PYQs and study material','Browse available IITM BS Qualifier, Foundation and Diploma resources by subject.',[hub,{name:'Resources',path}],filters,[{'@type':'CollectionPage',name:'IITM BS resources'},...itemList(available)]);return data;
  }
  const resource=path.match(/^\/iitm-bs\/resources\/([^/]+)\/([^/]+)$/);
  if(resource) {
    const match=findSubject(resource[1],resource[2]); if(!match) return unavailable(path);
    data.level=match.level.key;data.subject=match.subject.key;data.subjectName=match.subject.name;
    data.resources=mergedResources(await repo.resources({level:data.level,subject:data.subject}),data.level,data.subject);
    if(!data.resources.length) return unavailable(path);
    set('resource',`IITM BS ${data.level} ${data.subjectName} resources`,`Study ${data.subjectName} with available notes, past questions and community resources.`,[hub,{name:'Resources',path:'/iitm-bs/resources'},{name:data.subjectName,path}],filters,[{'@type':'LearningResource',url:'https://genziitian.in'+path,name:`${data.subjectName} resources`,learningResourceType:'Study resources',educationalLevel:data.level,provider:{'@id':orgId}},...itemList(data.resources.map(r=>({title:r.title,path:r.url}))),...data.resources.filter(r=>r.resource_type==='video'&&youtubeEmbed(r.url)).map(r=>({'@type':'VideoObject',name:r.title,description:r.description,url:r.url,embedUrl:youtubeEmbed(r.url)}))]);return data;
  }
  if(path==='/iitm-bs/graded-assignment' || path===assignmentBase) {
    data.weeks=approvedWeeks();set(path===assignmentBase?'assignment-subject':'assignments',path===assignmentBase?'IITM BS Computational Thinking graded assignments':'IITM BS graded assignment directory','Browse reviewed archived assignment explanations. Only populated, reviewed material appears here.',[hub,{name:'Graded assignments',path:'/iitm-bs/graded-assignment'},...(path===assignmentBase?[{name:'Computational Thinking',path}]:[])],filters || (path===assignmentBase&&!data.weeks.length),[{'@type':'CollectionPage',name:'Reviewed graded assignments'},...itemList(data.weeks.map(w=>({title:`Computational Thinking week ${w}`,path:assignmentPath(w)})))]);return data;
  }
  const week=path.match(/^\/iitm-bs\/graded-assignment\/foundation\/computational-thinking\/week-(\d+)$/);
  if(week) {
    const n=Number(week[1]); data.assignment=gradedAssignments.find(x=>x.week===`Week ${n}`);if(!data.assignment) return unavailable(path);
    data.review=assignmentReviews[n];data.weeks=approvedWeeks();
    set('assignment',`IITM BS CT graded assignment week ${n}: archived explanations`,`Computational Thinking week ${n} archived questions and explanations. Term and year are unverified.`,[hub,{name:'Graded assignments',path:'/iitm-bs/graded-assignment'},{name:'Computational Thinking',path:assignmentBase},{name:`Week ${n}`,path}],filters||data.review.status!=='reviewed',data.review.status==='reviewed'?[{'@type':'LearningResource',name:`Computational Thinking week ${n}`,learningResourceType:'Worked explanations',educationalLevel:'Foundation',dateModified:data.review.reviewed_at,provider:{'@id':orgId}}]:[]);return data;
  }
  if(path==='/blog') {
    let all=await repo.blogs();data.categories=[...new Set<string>(all.map((b:any)=>b.category).filter(Boolean))];
    const search=url.searchParams.get('search')?.trim().toLowerCase();const category=url.searchParams.get('category');
    if(search)all=all.filter((b:any)=>[b.title,b.summary,b.category].join(' ').toLowerCase().includes(search));
    if(category&&category!=='all')all=all.filter((b:any)=>b.category===category);
    if(url.searchParams.get('sort')==='oldest')all=[...all].reverse();
    const page=Math.max(1,Number.parseInt(url.searchParams.get('page')||'1')||1);const totalPages=Math.max(1,Math.ceil(all.length/9));if(page>totalPages) return unavailable(path);
    data.blogs=all.slice((page-1)*9,page*9);data.pagination={page,totalPages,total:all.length};
    set('blogs',`Online degree and IITM BS guides${page>1?` — page ${page}`:''}`,'Read researched online degree comparisons, IITM BS guides and learning advice.',[{name:'Blog',path:'/blog'}],filters,[{'@type':'CollectionPage',name:'GenZ IITian guides'},...itemList(data.blogs.map(b=>({title:b.title,path:`/blog/${b.slug}`})))]);
    return data;
  }
  const blog=path.match(/^\/blog\/([^/]+)$/);
  if(blog) {
    data.blog=await repo.blog(blog[1]);if(data.blog)data.blog={...data.blog,content:updateLinks(data.blog.content)};if(!data.blog) return unavailable(path);
    const b=data.blog; if(b.slug!==blog[1]&&/^[a-z0-9-]+$/.test(b.slug))data.redirectPath='/blog/'+b.slug; data.related=(await repo.blogs()).filter((x:any)=>x.slug!==b.slug).slice(0,4).map((x:any)=>({slug:'blog/'+x.slug,title:x.title}));
    const schema={'@type':'BlogPosting','@id':'https://genziitian.in'+path+'#article',headline:b.title,description:b.summary||b.seo_description,publisher:{'@id':orgId},mainEntityOfPage:{'@id':'https://genziitian.in'+path+'#webpage'},
      ...(b.author?{author:{'@type':'Person',name:b.author}}:{}),...(b.reviewer?{reviewedBy:{'@type':'Person',name:b.reviewer}}:{}),
      ...(validDate(b.published_at)?{datePublished:validDate(b.published_at)}:{}),...(validDate(b.modified_at)?{dateModified:validDate(b.modified_at)}:{}),...(b.image?{image:b.image.startsWith('/')?'https://genziitian.in'+b.image:b.image}:{})};
    set('blog',b.seo_title||b.title,b.seo_description||b.summary||b.title,[{name:'Blog',path:'/blog'},{name:b.title,path}],filters,[schema]);data.seo.image=b.image||data.seo.image;return data;
  }
  if(path==='/docs') {data.docs=docsData.map(d=>({...d,sections:[]}));set('docs','IITM BS reference documents','Read degree references, handbooks and subject learning documents.',[{name:'Docs',path}],filters,[{'@type':'CollectionPage',name:'Reference documents'},...itemList(docsData.map(d=>({title:d.title,path:`/docs/${d.slug}`})))]);return data;}
  const doc=path.match(/^\/docs\/([^/]+)$/);
  if(doc) {data.doc=docsData.find(d=>d.slug===doc[1]);if(!data.doc)return unavailable(path);
    // Existing static docs preserved; no invented verification dates.
    data.doc={...data.doc,sections:data.doc.sections.map(s=>({...s,items:s.items.map(i=>({...i,content:i.content.map(b=>({...b,...(b.type==='html'?{value:sanitize(b.value)}:{})}))}))}))};
    set('doc',data.doc.title,data.doc.description,[{name:'Docs',path:'/docs'},{name:data.doc.title,path}],filters);return data;}
  if(path==='/knowledge') {
    const page=Math.max(1,Number.parseInt(url.searchParams.get('page')||'1')||1); const result=await repo.knowledgeList({page,limit:20,search:url.searchParams.get('search')});
    data.pages=result.pages;data.pagination=result.pagination;if(page>Math.max(1,result.pagination.totalPages))return unavailable(path);
    set('knowledge-directory',`Knowledge library${page>1?` — page ${page}`:''}`,'Browse published learning guides and knowledge pages.',[{name:'Knowledge',path:'/knowledge'}],filters,[{'@type':'CollectionPage',name:'Knowledge library'},...itemList(result.pages.map((p:any)=>({title:p.title,path:'/'+p.slug})))]);return data;
  }
  // Never treat unmatched paths below fixed public namespaces as arbitrary knowledge pages.
  if(['/iitm-bs','/blog','/docs','/about','/contact'].some(p=>path.startsWith(p+'/')))return unavailable(path);
  data.knowledge=await repo.knowledge(path.slice(1));if(data.knowledge)data.knowledge={...data.knowledge,introduction:updateLinks(data.knowledge.introduction||''),sections:data.knowledge.sections?.map(s=>({...s,body:updateLinks(s.body)})),internal_links:data.knowledge.internal_links?.map(l=>({...l,url:migrateResourceLink(l.url)}))};if(!data.knowledge)return unavailable(path);
  data.related=await repo.related(path.slice(1));set('knowledge',data.knowledge.title,data.knowledge.meta_description||data.knowledge.title,[{name:'Knowledge',path:'/knowledge'},{name:data.knowledge.title,path}],filters);return data;
}
