import {useEffect,useState} from 'react';
import {catalogue,resourcePath,assignmentPath,assignmentBase,BRAND} from './catalogue';
import type {PublicData,Resource} from './types';
import type {ContentBlock} from '../data/docsData';
import About from '../pages/About';
import Contact from '../pages/Contact';
import './public.css';
import {youtubeEmbed} from './video';
const guideLinks=[
  ['/blog/online-degree-guide-india','Online degree guide for India'],
  ['/blog/iitm-bs-vs-iit-patna','IITM BS vs IIT Patna CSDA'],
  ['/blog/iitm-bs-degree-guide','IITM BS degree guide'],
  ['/blog/iit-patna-online-hybrid-degree-guide','IIT Patna programme guide'],
];
function GuideLinks() {return <div className="public-grid">{guideLinks.map(([url,text])=><a className="public-card" href={url} key={url}>{text}<span aria-hidden="true"> →</span></a>)}</div>}
function Account() {
  const [name,setName]=useState('Account');
  useEffect(()=>{let active=true; import('../lib/supabase').then(async({supabase})=>{const {data}=await supabase.auth.getSession();if(active&&data.session)setName('My account');}).catch(()=>{});return()=>{active=false};},[]);
  return <a href="/profile">{name}</a>;
}
function ResourceDirectory({resources}:{resources:Resource[]}) {
  const [level,setLevel]=useState('all');const [search,setSearch]=useState('');
  return <><p>Choose a subject to browse available notes, past questions, videos and tools. Community contributions retain their original attribution.</p>
    <div className="public-controls"><label>Level <select aria-label="Level" value={level} onChange={e=>setLevel(e.target.value)}><option value="all">All levels</option>{catalogue.map(l=><option key={l.slug} value={l.slug}>{l.key}</option>)}</select></label><label>Find a subject <input value={search} onChange={e=>setSearch(e.target.value)} type="search" placeholder="Search subjects"/></label></div>
    {catalogue.filter(l=>level==='all'||l.slug===level).map(l=><section key={l.slug}><h2>{l.key}</h2><div className="public-grid">{l.subjects.filter(s=>resources.some(r=>r.level===l.key&&r.subject===s.key)&&[s.key,s.name].join(' ').toLowerCase().includes(search.toLowerCase())).map(s=><a className="public-card" key={s.slug} href={resourcePath(l.key,s.key)!}>{s.name}<small>{resources.filter(r=>r.level===l.key&&r.subject===s.key).length} resources</small></a>)}</div></section>)}</>;
}
function ResourceLesson({data}:{data:PublicData}) {
  const [type,setType]=useState('all'); const [search,setSearch]=useState('');const resources=data.resources||[];
  return <><p>Resources for IITM BS {data.level} {data.subjectName}. Links open the original contributor’s material. Check the current official syllabus before using archived resources.</p>
    <div className="public-controls"><label>Search resources <input type="search" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
    <div className="public-tabs" role="group" aria-label="Resource type">{[['all','All'],['note','Notes'],['pyq','Past questions'],['video','Videos'],['tool','Tools']].map(([value,text])=><button key={value} aria-pressed={type===value} onClick={()=>setType(value)}>{text}</button>)}</div>
    <div className="public-grid">{resources.filter(r=>(type==='all'||r.resource_type===type)&&[r.title,r.description].join(' ').toLowerCase().includes(search.toLowerCase())).map(r=><article className="public-card" key={r.url}><small>{r.sub_type||r.resource_type}</small><h2>{r.title}</h2><p>{r.description}</p>{r.resource_type==='video'&&youtubeEmbed(r.url)&&<iframe title={r.title} src={youtubeEmbed(r.url)!} loading="lazy" allowFullScreen/>}<a href={r.url} rel="noopener noreferrer">Open resource →</a></article>)}</div>
    <p><a href="/iitm-bs/resources">Browse other subjects</a> · <a href="/iitm-bs/graded-assignment">Graded assignment directory</a> · <a href="/courses">Explore courses</a></p></>;
}
function Assignment({data}:{data:PublicData}) {
  const a=data.assignment!;
  return <><aside className="public-notice"><strong>{data.review?.status==='reviewed'?'Reviewed archive':'Under review — not indexed'}</strong><p>{data.review?.note}</p><p>Term/year: unknown. This is archived practice material, not the current graded assignment.</p>{data.review?.reviewed_at&&<p>Reviewed: <time dateTime={data.review.reviewed_at}>{data.review.reviewed_at}</time></p>}</aside>
    <p>Source: the supplied Computational Thinking assignment-solutions PDF, starting on page {a.pdfPage}. Original authorship and term have not been independently verified. <a href={`${a.pdfPath}#page=${a.pdfPage}`}>Read the original source</a>.</p>
    <p>{a.intro}</p>
    {a.questions.map((q,i)=><section className="public-question" key={i}><h2>Question {q.number}{q.points?` (${q.points})`:''}</h2>{q.prompt&&<p>{q.prompt}</p>}
      <details><summary>Show question and worked explanation</summary><div>{q.blocks.map((b,j)=>b.kind==='code'?<pre key={j}><code>{b.text}</code></pre>:b.kind==='options'?<ul key={j}>{b.items?.map((o,k)=><li key={k}>{o}</li>)}</ul>:<p key={j} className="public-preserve">{b.text}</p>)}</div></details></section>)}
    <nav aria-label="Available reviewed weeks">{data.weeks?.filter(w=>`Week ${w}`!==a.week).map(w=><a key={w} href={assignmentPath(w)}>Week {w}</a>)}</nav></>;
}
function DocBlock({block:b}:{block:ContentBlock}) {
  switch(b.type) {
    case 'html':return <div className="public-prose" dangerouslySetInnerHTML={{__html:b.value||''}}/>;
    case 'heading':return <h3>{b.value}</h3>;
    case 'list':return <ul>{b.items?.map((v,i)=><li key={i}>{v}</li>)}</ul>;
    case 'table':return <div className="public-table"><table><thead><tr>{b.columns?.map((c,i)=><th key={i} scope="col">{c}</th>)}</tr></thead><tbody>{b.rows?.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>;
    case 'fee-table':return <div className="public-table"><table><thead><tr><th>Course</th><th>Code</th><th>Credits</th><th>Prerequisites</th></tr></thead><tbody>{b.courses?.map((r,i)=><tr key={i}><td>{r.name}</td><td>{r.code}</td><td>{r.credits}</td><td>{r.prerequisites}</td></tr>)}</tbody></table></div>;
    case 'stats':return <dl className="public-grid">{b.stats?.map((v,i)=><div className="public-card" key={i}><dt>{v.label}</dt><dd>{v.value} {v.sub}</dd></div>)}</dl>;
    case 'image':return b.src?.startsWith('/')||b.src?.startsWith('https://')?<img src={b.src} alt={b.alt||''} loading="lazy"/>:null;
    case 'divider':return <hr/>;
    case 'callout':return <aside className="public-notice">{b.value}</aside>;
    default:return <p className="public-preserve">{b.value}</p>;
  }
}
function Pagination({data,base}:{data:PublicData;base:string}) {
  const link=(page:number)=>{const params=new URLSearchParams(data.query);for(const k of [...params.keys()])if(!['search','category','sort'].includes(k))params.delete(k);if(page>1)params.set('page',String(page));const query=params.toString();return base+(query?'?'+query:'');};
  return data.pagination&&data.pagination.totalPages>1?<nav className="public-pagination" aria-label="Archive pages">{Array.from({length:data.pagination.totalPages},(_,i)=>i+1).map(p=><a key={p} aria-current={data.pagination!.page===p?'page':undefined} href={link(p)}>{p}</a>)}</nav>:null;
}
function BlogArchive({data}:{data:PublicData}) {
  const q=new URLSearchParams(data.query);
  return <><form className="public-controls" method="get" action="/blog"><label>Search articles <input name="search" type="search" defaultValue={q.get('search')||''}/></label><label>Category <select name="category" aria-label="Category" defaultValue={q.get('category')||'all'}><option value="all">All categories</option>{data.categories?.map(c=><option key={c}>{c}</option>)}</select></label><label>Sort <select name="sort" aria-label="Sort" defaultValue={q.get('sort')||'newest'}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label><button type="submit">Apply filters</button></form><BlogCards data={data}/>{!data.blogs?.length&&<p>No published articles match these filters.</p>}<Pagination data={data} base="/blog"/></>;
}
function DocsDirectory({data}:{data:PublicData}) {const [search,setSearch]=useState('');return <><label>Search documents <input type="search" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="public-grid">{data.docs?.filter(doc=>[doc.title,doc.description].join(' ').toLowerCase().includes(search.toLowerCase())).map(doc=><a key={doc.slug} className="public-card" href={`/docs/${doc.slug}`}><h2>{doc.title}</h2><p>{doc.description}</p></a>)}</div></>}
function PageContent({data:d}:{data:PublicData}) {
  switch(d.kind) {
    case 'home':return <><section className="public-hero"><span className="public-eyebrow">LEARN · PRACTISE · PROGRESS</span><h1>IITM BS degree learning resources and guidance</h1><p>We help online and hybrid degree students study with notes, quizzes, past questions and expert-led lectures.</p><div className="public-actions"><a className="public-button" href="/courses">Explore courses →</a><a href="/iitm-bs/resources">Find study resources</a></div></section><section><h2>Understand your degree options</h2><GuideLinks/></section><section><h2>Study with GenZ IITian</h2><div className="public-grid"><a className="public-card" href="/iitm-bs">IITM BS information hub</a><a className="public-card" href="/iitm-bs/resources">Notes and past questions</a><a className="public-card" href="/iitm-bs/graded-assignment">Assignment directory</a><a className="public-card" href="/tools/cgpa-calculator">CGPA calculator</a></div></section><section><h2>From the blog</h2><BlogCards data={d}/></section></>;
    case 'hub':return <><h1>IITM BS degree: guides and study resources</h1><p>GenZ IITian publishes independent guidance for learners exploring or studying the IIT Madras BS in Data Science and Applications. For admissions and programme rules, consult IIT Madras directly.</p><GuideLinks/><h2>Find material for your next study session</h2><div className="public-grid"><a className="public-card" href="/iitm-bs/resources">Subject resources</a><a className="public-card" href="/iitm-bs/graded-assignment">Reviewed graded assignments</a><a className="public-card" href="/docs">Reference documents</a><a className="public-card" href="/courses">Existing GenZ courses</a></div><h2>How should I start?</h2><p>Read the programme guide first, choose your level and subject, then use notes alongside your official coursework. Archived examples help you practise the method; always check the current assignment in your official portal.</p><p><a href="https://study.iitm.ac.in/ds/">Official IIT Madras programme website</a></p></>;
    case 'about':return <><p className="public-notice">GenZ IITian is an independent learning publisher and support community. It is not IIT Madras or IIT Patna and does not award their degrees.</p><About/></>;
    case 'contact':return <><p>For support, email <a href="mailto:help@genziitian.in">help@genziitian.in</a>.</p><Contact/></>;
    case 'resources':return <><h1>IITM BS resources: notes, PYQs and study material</h1><ResourceDirectory resources={d.resources||[]}/></>;
    case 'resource':return <><h1>{d.subjectName} resources — {d.level}</h1><ResourceLesson data={d}/></>;
    case 'assignments':case 'assignment-subject':return <><h1>{d.kind==='assignments'?'IITM BS graded assignment directory':'Computational Thinking graded assignments'}</h1><p>Only reviewed, populated archive material is listed here. Term and year must be identified before any material is presented as current.</p>{d.weeks?.length?<div className="public-grid">{d.kind==='assignments'?<a className="public-card" href={assignmentBase}>Foundation · Computational Thinking<small>{d.weeks.length} reviewed archive weeks</small></a>:d.weeks.map(w=><a className="public-card" href={assignmentPath(w)} key={w}>Week {w}</a>)}</div>:<p>Archive explanations are being checked against their source. No reviewed weeks are available yet.</p>}<p><a href="/iitm-bs/resources/foundation/computational-thinking">Computational Thinking resources</a></p></>;
    case 'assignment':return <><h1>Computational Thinking graded assignment {d.assignment?.week.toLowerCase()} — archive</h1><Assignment data={d}/></>;
    case 'blogs':return <><h1>Online degree and IITM BS guides</h1><p>Research, comparisons and learning advice from the independent GenZ IITian publisher.</p><BlogArchive data={d}/></>;
    case 'blog':return <article><span className="public-eyebrow">{d.blog!.category}</span><h1>{d.blog!.title}</h1>{d.blog!.summary&&<p className="public-lead">{d.blog!.summary}</p>}<div className="public-byline">{d.blog!.author&&<span>By {d.blog!.author} · </span>}{d.blog!.reviewer&&<span>Reviewed by {d.blog!.reviewer} · </span>}{d.blog!.published_at&&<span>Published {new Date(d.blog!.published_at).toISOString().slice(0,10)} · </span>}{d.blog!.modified_at&&<span>Revised {new Date(d.blog!.modified_at).toISOString().slice(0,10)} · </span>}{d.blog!.last_verified_at&&<span>Sources checked {d.blog!.last_verified_at.slice(0,10)}</span>}</div>{d.blog!.image&&<img src={d.blog!.image} alt={d.blog!.image_alt||''} className="public-cover"/>}<div className="public-prose" dangerouslySetInnerHTML={{__html:d.blog!.content}}/>{!!d.blog!.source_references?.length&&<section><h2>Sources</h2><ul>{d.blog!.source_references.map((s,i)=><li key={i}><a href={s.url} rel="noopener noreferrer">{s.title}</a></li>)}</ul></section>}<p className="public-notice">GenZ IITian is an independent publisher. Check official programme information before making an admission or payment decision.</p></article>;
    case 'docs':return <><h1>Reference documents</h1><DocsDirectory data={d}/></>;
    case 'doc':return <><h1>{d.doc!.title}</h1><p>{d.doc!.description}</p><p className="public-notice">Existing reference content is retained. Rules, fees and dates may change; verify these with the programme’s official website.</p><nav aria-label="Document sections"><ul>{d.doc!.sections.map((s,i)=><li key={i}><a href={`#section-${i}`}>{s.title}</a></li>)}</ul></nav>{d.doc!.sections.map((s,i)=><section key={i} id={`section-${i}`}><h2>{s.title}</h2>{s.items.map(item=><section id={item.slug} key={item.slug}><h3>{item.title}</h3>{item.content.map((b,j)=><DocBlock key={j} block={b}/>)}</section>)}</section>)}</>;
    case 'knowledge-directory':return <><h1>Knowledge library</h1><form method="get"><label>Search published guides <input name="search" type="search"/></label><button type="submit">Search</button></form><div className="public-grid">{d.pages?.map(p=><a className="public-card" key={p.slug} href={'/'+p.slug}><h2>{p.title}</h2><p>{p.meta_description}</p></a>)}</div><Pagination data={d} base="/knowledge"/></>;
    case 'knowledge':return <><h1>{d.knowledge!.h1||d.knowledge!.title}</h1><div className="public-prose" dangerouslySetInnerHTML={{__html:d.knowledge!.introduction||''}}/>{d.knowledge!.sections?.map((s,i)=><section key={i}><h2>{s.heading}</h2><div className="public-prose" dangerouslySetInnerHTML={{__html:s.body}}/></section>)}{d.knowledge!.faq?.map((f,i)=><details key={i}><summary>{f.question}</summary><div className="public-prose" dangerouslySetInnerHTML={{__html:f.answer}}/></details>)}<ul>{d.knowledge!.internal_links?.map((l,i)=><li key={i}><a href={l.url}>{l.text}</a></li>)}</ul></>;
    default:return <><h1>{d.status===503?'Content temporarily unavailable':'Page not found'}</h1><p>{d.status===503?'Please try again shortly.':'This page does not exist or is not published.'}</p><a href="/iitm-bs">Browse the IITM BS hub</a></>;
  }
}
function BlogCards({data}:{data:PublicData}) {return <div className="public-grid">{data.blogs?.map(b=><article className="public-card" key={b.slug}><small>{b.category}</small><h2><a href={`/blog/${b.slug}`}>{b.title}</a></h2><p>{b.summary||b.seo_description}</p></article>)}</div>}
export default function PublicApp({data}:{data:PublicData}) {
  return <div className="public-site"><a href="#public-main" className="public-skip">Skip to content</a><header className="public-header"><a className="public-brand" href="/">GENZ <span>IITIAN</span></a><nav aria-label="Main navigation"><a href="/iitm-bs">IITM BS</a><a href="/iitm-bs/resources">Resources</a><a href="/iitm-bs/graded-assignment">Assignments</a><a href="/blog">Blog</a><a href="/courses">Courses</a><Account/></nav></header><main id="public-main" className="public-main">{!!data.seo.breadcrumbs.length&&<nav className="public-breadcrumbs" aria-label="Breadcrumb"><ol>{data.seo.breadcrumbs.map((c,i)=><li key={i}>{i===data.seo.breadcrumbs.length-1?<span aria-current="page">{c.name}</span>:<a href={c.path}>{c.name}</a>}</li>)}</ol></nav>}<PageContent data={data}/>{!!data.related?.length&&<section><h2>Continue reading</h2><ul>{data.related.map(p=><li key={p.slug}><a href={'/'+p.slug}>{p.title}</a></li>)}</ul></section>}</main><footer className="public-footer"><strong>{BRAND}</strong><p>Independent guidance and learning resources. We are not affiliated with IIT Madras or IIT Patna.</p><nav aria-label="Footer"><a href="/about">About</a><a href="/contact">Contact</a><a href="/iitm-bs/resources">Resources</a><a href="/docs">Docs</a><a href="/knowledge">Knowledge</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/refund">Refund policy</a><a href="https://youtube.com/@Gen-ZIITian/">YouTube</a></nav></footer></div>;
}
