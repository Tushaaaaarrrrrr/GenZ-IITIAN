import {SITE,BRAND} from './catalogue';
export type Crumb = {name:string;path:string};
export type Descriptor = {title:string;description:string;path:string;noindex:boolean;image?:string;breadcrumbs:Crumb[];schema:Record<string,unknown>[]};
export const orgId=SITE+'/#organization';
export function descriptor(input:Partial<Descriptor> & Pick<Descriptor,'title'|'description'|'path'>): Descriptor {
  const d={noindex:false,breadcrumbs:[],schema:[],...input};
  d.image ||= '/seo/genz-iitm-guides.png';
  const url=SITE+d.path;
  const identity = [
    {'@type':'Organization','@id':orgId,name:BRAND,url:SITE,description:'Independent learning resources and guidance for IITM BS students.',sameAs:['https://youtube.com/@Gen-ZIITian/','https://www.instagram.com/genz_iitian/','https://www.linkedin.com/company/102554405/']},
    {'@type':'WebSite','@id':SITE+'/#website',url:SITE,name:BRAND,publisher:{'@id':orgId},inLanguage:'en'},
  ];
  return {...d,schema:[...identity,{'@type':'WebPage','@id':url+'#webpage',url,name:d.title,description:d.description,isPartOf:{'@id':SITE+'/#website'},publisher:{'@id':orgId}},
    ...(d.breadcrumbs.length ? [{'@type':'BreadcrumbList','@id':url+'#breadcrumbs',itemListElement:d.breadcrumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:SITE+c.path}))}]:[]),...d.schema]};
}
export const safeJson = (value:unknown) => JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const escape = (value:string) => value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function metadataHtml(d:Descriptor) {
  const image=d.image && (d.image.startsWith('/')?SITE+d.image:d.image);
  const tags=[`<title>${escape(d.title)}</title>`,`<meta name="description" content="${escape(d.description)}">`,`<meta name="robots" content="${d.noindex?'noindex,follow':'index,follow'}">`,`<link rel="canonical" href="${escape(SITE+d.path)}">`,
    ...Object.entries({'og:site_name':BRAND,'og:type':d.schema.some(x=>x['@type']==='BlogPosting')?'article':'website','og:title':d.title,'og:description':d.description,'og:url':SITE+d.path,...(image?{'og:image':image}:{})}).map(([k,v])=>`<meta property="${k}" content="${escape(v)}">`),
    `<meta name="twitter:card" content="${image?'summary_large_image':'summary'}">`,`<meta name="twitter:title" content="${escape(d.title)}">`,`<meta name="twitter:description" content="${escape(d.description)}">`,...(image?[`<meta name="twitter:image" content="${escape(image)}">`]:[]),
    `<script id="public-schema" type="application/ld+json">${safeJson({'@context':'https://schema.org','@graph':d.schema})}</script>`];
  return tags.join('\n');
}
export function applyMetadata(d:Descriptor) {
  document.head.querySelectorAll('title,meta[name="description"],meta[name="robots"],meta[name^="twitter:"],meta[property^="og:"],link[rel="canonical"],#public-schema,#pseo-schema').forEach(e=>e.remove());
  const template=document.createElement('template'); template.innerHTML=metadataHtml(d); document.head.append(template.content);
}
