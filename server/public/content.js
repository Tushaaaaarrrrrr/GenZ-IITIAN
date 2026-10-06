import sanitizeHtml from 'sanitize-html';
export const isPublished = value => value === true || value === 1 || value === '1' || value === 'true';
export function safeUrl(value) {
  if (typeof value !== 'string') return '';
  if (value.startsWith('/') && !value.startsWith('//') && !/[\\\u0000-\u0020]/.test(value)) return value;
  try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; }
}
export const sanitize = value => sanitizeHtml(String(value || ''), {
  allowedTags: ['p','br','hr','h2','h3','h4','h5','h6','ul','ol','li','strong','em','b','i','u','blockquote','pre','code','table','thead','tbody','tr','th','td','caption','a','img','figure','figcaption','details','summary','sup','sub'],
  allowedAttributes: {a:['href','title'], img:['src','alt','width','height','loading'], th:['scope','colspan','rowspan'], td:['colspan','rowspan'], code:['class']},
  allowedSchemes: ['https','http','mailto'], allowProtocolRelative: false,
  transformTags: {a: (tag,attrs) => ({tagName: tag, attribs: {...attrs, rel:'noopener noreferrer'}})},
});
const json = (value, fallback) => { if (value == null) return fallback; if(typeof value !== 'string') return value; try{return JSON.parse(value);}catch{return fallback;} };
export const parseKnowledge = row => ({
  id:row.id, slug:row.slug, title:row.title, h1:row.h1 || row.title, meta_description:row.meta_description || '',
  playbook_type:row.playbook_type, cluster_topic:row.cluster_topic, primary_keyword:row.primary_keyword,
  introduction:sanitize(row.introduction), call_to_action:sanitize(row.call_to_action),
  sections:json(row.sections,[]).filter(x=>x && typeof x.heading==='string').map(x=>({heading:x.heading,body:sanitize(x.body)})),
  faq:json(row.faq,[]).filter(x=>x && typeof x.question==='string').map(x=>({question:x.question,answer:sanitize(x.answer)})),
  internal_links:json(row.internal_links,[]).filter(x=>safeUrl(x.url)).map(x=>({...x,url:safeUrl(x.url)})),
  related_pages:json(row.related_pages,[]), secondary_keywords:json(row.secondary_keywords,[]),
  schema_data:{}, updated_at:row.updated_at, published:isPublished(row.published),
});
const blogFields = 'id,title,slug,category,content,image,date,read_time,published,seo_title,seo_description,seo_keywords,summary,author,reviewer,source_references,last_verified_at,published_at,modified_at,image_alt,created_at,updated_at';
export function publicBlog(row) {
  return {...Object.fromEntries(blogFields.split(',').map(k=>[k,row[k]])), content:sanitize(row.content), image:safeUrl(row.image), published:1,
    source_references:json(row.source_references,[]).filter(x=>safeUrl(x.url)).map(x=>({title:String(x.title || x.url),url:safeUrl(x.url)}))};
}
const publicResource = r => ({id:r.id,level:r.level,subject:r.subject,resource_type:r.resource_type,sub_type:r.sub_type,title:r.title,description:r.description,url:safeUrl(r.url),updated_at:r.updated_at});
export function createPublicRepository(client) {
  function db() { if (!client) throw new Error('Public content service unavailable'); return client; }
  async function result(query) { const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),10000); try { const r=await query.abortSignal(controller.signal); if(r.error) throw r.error; return r; } finally {clearTimeout(timer);} }
  // Actual database types: blogs INTEGER, resources/pSEO BOOLEAN. Keep normalization at this boundary.
  return {
    async blogs() { const {data}=await result(db().from('blogs').select(blogFields).eq('published',1).order('id',{ascending:false})); return (data || []).filter(r=>isPublished(r.published)).map(publicBlog); },
    async blog(slug) { let {data}=await result(db().from('blogs').select(blogFields).eq('published',1).eq('slug',slug).maybeSingle()); if(!data && /^\d{1,18}$/.test(slug)) ({data}=await result(db().from('blogs').select(blogFields).eq('published',1).eq('id',slug).maybeSingle())); return data && isPublished(data.published) ? publicBlog(data) : null; },
    async resources(filters={}) {
      let q=db().from('resources').select('id,level,subject,resource_type,sub_type,title,description,url,published,updated_at').eq('published',true);
      if(filters.level) q=q.eq('level',filters.level); if(filters.subject) q=q.eq('subject',filters.subject); if(filters.type) q=q.eq('resource_type',filters.type);
      const {data}=await result(q.order('level').order('subject').order('id'));
      return (data||[]).filter(r=>isPublished(r.published)).map(publicResource).filter(r=>r.url);
    },
    async knowledge(slug) { const {data}=await result(db().from('pseo_pages').select('*').eq('published',true).eq('slug',slug).maybeSingle()); return data && isPublished(data.published) ? parseKnowledge(data) : null; },
    async knowledgeList(filters={}) {
      const page=Math.max(1,Math.floor(Number(filters.page)||1)); const limit=Math.min(100,Math.max(1,Math.floor(Number(filters.limit)||20)));
      let q=db().from('pseo_pages').select('id,slug,title,meta_description,primary_keyword,cluster_topic,playbook_type,word_count,updated_at,published',{count:'exact'}).eq('published',true);
      if(filters.type) q=q.eq('playbook_type',filters.type); if(filters.cluster) q=q.eq('cluster_topic',filters.cluster);
      if(filters.search) { const term=String(filters.search).replace(/[%_,().\\]/g,'').slice(0,100); if(term) q=q.or(`title.ilike.%${term}%,primary_keyword.ilike.%${term}%`); }
      const {data,count}=await result(q.order('updated_at',{ascending:false}).order('id').range((page-1)*limit,page*limit-1));
      return {pages:(data||[]).filter(r=>isPublished(r.published)).map(({published,...r})=>r),pagination:{page,limit,total:count||0,totalPages:Math.ceil((count||0)/limit)}};
    },
    async allKnowledge() {
      const rows=[]; let page=1; while(true) { const batch=await this.knowledgeList({page,limit:100}); rows.push(...batch.pages); if(page>=batch.pagination.totalPages) break; page++; } return rows;
    },
    async related(slug) {
      const page=await this.knowledge(slug); if(!page) return [];
      let q=db().from('pseo_pages').select('slug,title,playbook_type,meta_description,published').eq('published',true).neq('slug',slug);
      // Use separate parameterized queries rather than interpolate database text into PostgREST filters.
      const [a,b]=await Promise.all([result(q.eq('cluster_topic',page.cluster_topic).limit(6)),result(db().from('pseo_pages').select('slug,title,playbook_type,meta_description,published').eq('published',true).neq('slug',slug).eq('playbook_type',page.playbook_type).limit(6))]);
      return [...new Map([...(a.data||[]),...(b.data||[])].filter(r=>isPublished(r.published)).map(r=>[r.slug,(({published,...p})=>p)(r)])).values()].slice(0,6);
    },
    async clusters() {
      const {data}=await result(db().from('pseo_clusters').select('*')); const pages=await this.allKnowledge();
      return (data||[]).map(c=>({...c,actual_page_count:pages.filter(p=>p.cluster_topic===c.name).length})).sort((a,b)=>b.actual_page_count-a.actual_page_count);
    },
    async settings() { const {data}=await result(db().from('settings').select('key,value')); return Object.fromEntries((data||[]).filter(s=>['site_title','site_description','site_image'].includes(s.key)).map(s=>[s.key,s.value])); },
    async courses() { const {data}=await result(db().from('courses').select('id,active').or('active.eq.true,active.is.null')); return data || []; },
  };
}
