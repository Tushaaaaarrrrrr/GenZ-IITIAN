import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createPublicRepository} from './content.js';
export const SITE='https://genziitian.in';
const xmlEscape=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const goodSlug = s => typeof s==='string' && /^[a-z0-9]+(?:[a-z0-9/-]*[a-z0-9])?$/.test(s) && !s.includes('//') && !s.includes('/../');
const modify = s => s && !Number.isNaN(Date.parse(s)) ? `<lastmod>${new Date(s).toISOString()}</lastmod>` : '';
const urlSet=entries=>`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(e=>`<url><loc>${xmlEscape(SITE+e.path)}</loc>${modify(e.modified)}</url>`).join('')}</urlset>`;
export async function createPublicHttp({root,client=null,repository=null,renderer=null,dev=false,staging=process.env.SEO_STAGING==='true'}) {
  const repo=repository||createPublicRepository(client);
  let vite;
  if(dev){const {createServer}=await import('vite');vite=await createServer({root,server:{middlewareMode:true},appType:'custom'});}
  const ssr=()=>renderer||(dev?vite.ssrLoadModule('/src/public/entry-server.tsx'):import(pathToFileURL(path.join(root,'dist-server/entry-server.js')).href));
  const template=async()=>{const file=await fs.readFile(path.join(root,dev?'index.html':'dist/index.html'),'utf8');return dev?vite.transformIndexHtml('/',file):file;};
  async function html(data,req,res,spa=false) {
    const r=await ssr();let shell=await template();
    if(staging) data.seo={...data.seo,noindex:true};
    // Course/checkout shell remains untouched except staging's HTTP indexing control.
    if(!spa || !req.path.startsWith('/courses')) shell=shell.replace(/<title>[\s\S]*?<\/title>/,'').replace('</head>',`${r.metadataHtml(data.seo)}\n</head>`);
    if(!spa) shell=shell.replace('<div id="root"></div>',`<div id="root">${r.render(data)}</div><script id="public-data" type="application/json">${r.safeJson(data)}</script>`);
    if(staging || data.seo.noindex)res.set('X-Robots-Tag','noindex, follow');
    res.status(data.status).type('html').set('Cache-Control','no-store').send(shell);
  }
  async function inventory(r) {
    const [blogs,resources,knowledge,courses]=await Promise.all([repo.blogs(),repo.resources(),repo.allKnowledge(),repo.courses()]);
    const merged=r.mergedResources(resources);
    const resourceEntries=r.catalogue.flatMap(l=>l.subjects.filter(s=>merged.some(x=>x.level===l.key&&x.subject===s.key)).map(s=>({path:r.resourcePath(l.key,s.key),modified:merged.filter(x=>x.level===l.key&&x.subject===s.key).map(x=>x.updated_at).filter(Boolean).sort().at(-1)})));
    return {
      pages:[{path:'/'},{path:'/iitm-bs'},{path:'/iitm-bs/resources'},{path:'/iitm-bs/graded-assignment'},{path:'/blog'},{path:'/docs'},{path:'/knowledge'},{path:'/about'},{path:'/contact'},...r.docsData.map(d=>({path:'/docs/'+d.slug}))],
      blogs:blogs.filter(b=>goodSlug(b.slug)).map(b=>({path:'/blog/'+b.slug,modified:b.modified_at||b.updated_at||b.published_at})),resources:resourceEntries,
      assignments:[...(r.approvedWeeks().length?[{path:r.assignmentBase}]:[]),...r.approvedWeeks().map(w=>({path:r.assignmentPath(w),modified:r.assignmentReviews[w].reviewed_at}))],
      knowledge:knowledge.filter(k=>goodSlug(k.slug)&&!r.applicationRoute('/'+k.slug)&&!r.isPublicPath('/'+k.slug)).map(k=>({path:'/'+k.slug,modified:k.updated_at})),
      courses:[{path:'/courses'},...courses.map(c=>({path:'/courses/'+encodeURIComponent(c.id)}))],
    };
  }
  const api = async (req,res,next) => {
    try {
      if(req.method!=='GET'&&req.method!=='HEAD')return next();
      if(req.path==='/api/blogs')return res.json(await repo.blogs());
      const blog=req.path.match(/^\/api\/blogs\/([^/]+)$/);
      if(blog){const row=await repo.blog(decodeURIComponent(blog[1]));return row?res.json(row):res.status(404).json({error:'Blog not found'});}
      if(req.path==='/api/resources' || req.path==='/api/resources/subjects') {
        const r=await ssr();const {level,subject,type}=req.query;
        const selectedLevel=level?r.catalogue.find(l=>l.slug===String(level).toLowerCase()):null;
        if(level&&!selectedLevel)return res.json([]);
        const match=subject?(selectedLevel?r.findSubject(selectedLevel.key,String(subject)):r.catalogue.map(l=>r.findSubject(l.key,String(subject))).find(Boolean)):null;
        if(subject&&!match)return res.json([]);
        if(type&&!['note','pyq','video','tool'].includes(String(type)))return res.json([]);
        const filters={level:selectedLevel?.key,subject:match?.subject.key,type};
        const rows=r.mergedResources(await repo.resources(filters),filters.level,filters.subject,type);
        if(req.path.endsWith('/subjects'))return res.json([...new Map(rows.map(row=>[row.level+'/'+row.subject,{level:row.level,subject:row.subject}])).values()]);
        return res.json(rows);
      }
      if(req.path.startsWith('/api/pseo/page/')){const row=await repo.knowledge(decodeURIComponent(req.path.slice('/api/pseo/page/'.length)));return row?res.json(row):res.status(404).json({error:'Page not found'});}
      if(req.path==='/api/pseo/pages')return res.json(await repo.knowledgeList(req.query));
      if(req.path.startsWith('/api/pseo/related/'))return res.json(await repo.related(decodeURIComponent(req.path.slice('/api/pseo/related/'.length))));
      if(req.path==='/api/pseo/clusters')return res.json(await repo.clusters());
      if(req.path==='/api/pseo/sitemap.xml'){const r=await ssr();const entries=await inventory(r);return res.type('application/xml').send(urlSet(Object.values(entries).flat()));}
      next();
    }catch(err){console.error('Public API failed:',err.message);res.status(503).json({error:'Public content temporarily unavailable'});}
  };
  const early = async(req,res,next)=>{
    try {
      if(req.method!=='GET'&&req.method!=='HEAD')return next();
      // Crawler files are served before static assets or document rendering.
      if(req.path==='/robots.txt') {
        // No training-specific groups were present in the supplied source. Retain
        // deployment-specific training groups via ROBOTS_TRAINING_RULES verbatim.
        const training=process.env.ROBOTS_TRAINING_RULES||'';
        const rules=staging?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /manager/\nDisallow: /checkout/\nDisallow: /cart\nDisallow: /profile\nDisallow: /refer\nDisallow: /access-pdf\n\n${training}\nSitemap: ${SITE}/sitemap.xml\n`;
        return res.type('text/plain').send(rules);
      }
      if(req.path==='/sitemap.xml') {const names=['pages','blogs','resources','assignments','knowledge','courses'];return res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${(staging?[]:names).map(n=>`<sitemap><loc>${SITE}/sitemaps/${n}.xml</loc></sitemap>`).join('')}</sitemapindex>`);}
      const sitemap=req.path.match(/^\/sitemaps\/(pages|blogs|resources|assignments|knowledge|courses)\.xml$/);
      if(sitemap){const r=await ssr();const entries=staging?{}:await inventory(r);return res.type('application/xml').send(urlSet(entries[sitemap[1]]||[]));}
      if(req.path==='/llms.txt'){
        if(staging)return res.type('text/plain').send('# GenZ IITian\n\nStaging site. Public content is not indexed.\n');
        const r=await ssr();const entries=await inventory(r);
        const lines=['# GenZ IITian','','Independent learning publisher for IITM BS students. Not affiliated with IIT Madras or IIT Patna. Official institutions determine programme rules and award degrees.','','## Main pages','- [IITM BS hub](https://genziitian.in/iitm-bs)','- [Resources](https://genziitian.in/iitm-bs/resources)','- [Reviewed assignment directory](https://genziitian.in/iitm-bs/graded-assignment)','','## Published guides',...entries.blogs.map(b=>`- [${b.path.split('/').at(-1).replaceAll('-',' ')}](${SITE+b.path})`),'','## Reviewed learning material',...entries.assignments.map(a=>`- [${a.path.split('/').at(-1)}](${SITE+a.path})`),'','## Published knowledge',...entries.knowledge.map(k=>`- [${k.path.slice(1).replaceAll('-',' ')}](${SITE+k.path})`),''];
        return res.type('text/plain').send(lines.join('\n'));
      }
      if(req.path.startsWith('/api')||req.path.startsWith('/admin')||req.path.startsWith('/assets/')||/\.[a-z0-9]+$/i.test(req.path))return next();
      const r=await ssr();const raw=req.path;
      let normalized;
      try{normalized=decodeURIComponent(raw).replace(/\/+$/,'')||'/';}catch{return html(r.unavailable(raw),req,res);}
      const query=req.originalUrl.includes('?')?req.originalUrl.slice(req.originalUrl.indexOf('?')):'';
      let destination=null;
      // Normalization excludes course/checkout paths while the campaign is active.
      if(!/^\/(courses|checkout)(\/|$)/.test(normalized))normalized=normalized.toLowerCase();
      if(normalized==='/resources')destination='/iitm-bs/resources';
      else if(normalized==='/graded-assignment')destination='/iitm-bs/graded-assignment';
      else {
        const legacy=normalized.match(/^\/(?:resources|iitm-bs\/resources)\/([^/]+)\/([^/]+)$/);
        if(legacy){destination=r.resourcePath(legacy[1],legacy[2]);if(!destination)return html(r.unavailable(raw),req,res);}
      }
      if(destination&&destination!==raw)return res.redirect(301,destination+query);
      if(normalized!==raw && !/^\/(courses|checkout)(\/|$)/.test(raw))return res.redirect(301,normalized+query);
      next();
    }catch(err){console.error('Public route preparation failed:',err.message);res.status(503).set('Retry-After','60').set('X-Robots-Tag','noindex').type('text/plain').send('Public content temporarily unavailable');}
  };
  const document=async(req,res,next)=>{
    if(req.method!=='GET'&&req.method!=='HEAD')return next();
    if(req.path.startsWith('/api/')||req.path.startsWith('/admin/')||req.path==='/api'||req.path==='/admin')return res.status(404).json({error:'Not found'});
    try {
      const r=await ssr();
      if(/\.[a-z0-9]+$/i.test(req.path))return html(r.unavailable(req.path),req,res);
      const route=r.applicationRoute(req.path);
      if(route) {
        const title=({ '/tools/cgpa-calculator':'IITM BS CGPA calculator','/tools/grade-predictor':'IITM BS grade predictor','/tools/grading-scale':'IITM BS grading scale','/one-to-one':'One-to-one mentorship','/1-on-1':'One-to-one mentorship','/syllabus':'IITM BS syllabus','/terms':'Terms and conditions','/privacy':'Privacy policy','/refund':'Refund policy','/careers':'Careers','/newsletter':'Newsletter','/menu':'Explore GenZ IITian','/ecosystem':'GenZ IITian ecosystem'})[req.path]||route[1];
        const data={kind:'application',path:req.path,status:200,seo:r.descriptor({path:req.path,title:`${title} | GenZ IITian`,description:`${title} on GenZ IITian.`,noindex:route[2]})};
        return html(data,req,res,true);
      }
      const data=await r.loadPublic(new URL(req.originalUrl,SITE),repo);
      if(data.redirectPath)return res.redirect(301,data.redirectPath+(req.originalUrl.includes('?')?req.originalUrl.slice(req.originalUrl.indexOf('?')):''));
      return html(data,req,res);
    }catch(err){console.error('Public document failed:',err.message);res.set('Retry-After','60');
      try{const r=await ssr();return await html(r.unavailable(req.path,503),req,res);}catch{res.status(503).set('X-Robots-Tag','noindex').type('text/plain').send('Public content temporarily unavailable');}
    }
  };
  return {early,api,document,assets:dev?vite.middlewares:null,close:()=>vite?.close(),inventory:async()=>inventory(await ssr())};
}
