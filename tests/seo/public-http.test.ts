import {describe,it,expect,beforeAll,afterAll} from 'vitest';
import express from 'express';
import type {Server} from 'node:http';
import {createPublicHttp} from '../../server/public/http.js';
import {fixtureRepository,guides} from './fixtures.js';
import * as renderer from '../../src/public/entry-server';
import {parseKnowledge,isPublished,sanitize,createPublicRepository} from '../../server/public/content.js';
import {safeJson} from '../../src/public/metadata';
import {findSubject} from '../../src/public/catalogue';
import {gradedAssignments} from '../../src/data/gradedAssignments';
import path from 'node:path';
let server:Server;let base:string;
beforeAll(async()=>{
 const middleware=await createPublicHttp({root:path.resolve('.'),repository:fixtureRepository(),renderer});
 const app=express();app.use(middleware.early);app.use(middleware.api);app.use(express.static('dist',{index:false}));app.use(middleware.document);
 server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));base=`http://127.0.0.1:${(server.address() as any).port}`;
});
afterAll(()=>new Promise<void>(resolve=>server.close(()=>resolve())));
const get=(p:string)=>fetch(base+p,{redirect:'manual'});
describe('document routes and campaign boundaries',()=>{
 it.each([
  ['/resources?ref=AB123&utm_campaign=test','/iitm-bs/resources?ref=AB123&utm_campaign=test'],
  ['/resources/Foundation/CT?gclid=xyz','/iitm-bs/resources/foundation/computational-thinking?gclid=xyz'],
  ['/resources/Diploma/MAD%201','/iitm-bs/resources/diploma/mad-1'],
  ['/iitm-bs/resources/Foundation/Maths%201/','/iitm-bs/resources/foundation/mathematics-1'],
  ['/graded-assignment?ref=AB123','/iitm-bs/graded-assignment?ref=AB123'],
  ['/blog/1?ref=AB123','/blog/online-degree-guide-india?ref=AB123'],
 ])('redirects %s once to final URL',async(old,destination)=>{const r=await get(old);expect(r.status).toBe(301);expect(r.headers.get('location')).toBe(destination);const target=await get(destination);expect(target.status).not.toBe(301);});
 it.each(['/resources/unknown/CT','/resources/Foundation/unknown','/missing-page','/blog/unpublished','/iitm-bs/graded-assignment/foundation/computational-thinking/week-4','/docs/nonexistent'])('returns 404 for %s',async p=>{const r=await get(p);expect(r.status).toBe(404);expect(r.headers.get('x-robots-tag')).toContain('noindex');});
 it.each(['/','/iitm-bs','/iitm-bs/resources','/iitm-bs/resources/foundation/computational-thinking','/blog','/blog/iitm-bs-vs-iit-patna','/docs','/docs/iit-madras-bs-degree','/about','/contact','/guide/test-knowledge'])('server-renders meaningful HTML at %s',async p=>{const r=await get(p);expect(r.status).toBe(200);const html=await r.text();expect(html).toMatch(/<h1[^>]*>[^<]+/);expect(html).toContain('rel="canonical"');expect(html).toContain('property="og:title"');expect(html).toContain('id="public-data"');const schema=JSON.parse(html.match(/id="public-schema" type="application\/ld\+json">([^]*?)<\/script>/)![1]);expect(schema['@context']).toBe('https://schema.org');expect(schema['@graph'].some((s:any)=>s['@type']==='Organization')).toBe(true);});
 it('keeps campaign document URLs and query strings untouched',async()=>{for(const p of ['/courses/campaign-course?ref=AB123&utm_campaign=test','/checkout/Campaign-COURSE?courseId=campaign-course&ref=AB123','/cart']){const r=await get(p);expect(r.status).toBe(200);expect(r.headers.get('location')).toBeNull();expect(await r.text()).not.toContain('id="public-data"');}});
 it('uses clean canonicals and noindex search results',async()=>{const html=await(await get('/blog?search=iitm&utm_source=ads')).text();expect(html).toContain('href="https://genziitian.in/blog"');expect(html).toContain('content="noindex,follow"');expect(html).not.toContain('rel="canonical" href="https://genziitian.in/blog?search');});
 it('keeps solution text in HTML behind accessible disclosures',async()=>{const r=await get('/iitm-bs/graded-assignment/foundation/computational-thinking/week-1');const html=await r.text();expect(r.status).toBe(200);expect(html).toContain('<details>');expect(html).toContain('percentage ≥ 85');expect(html).toContain('noindex,follow');expect(html).toContain('Term/year: unknown');});
 it('returns explicit public API shapes without drafts',async()=>{expect(await(await get('/api/blogs')).json()).toHaveLength(4);expect((await get('/api/blogs/unpublished')).status).toBe(404);const page=await(await get('/api/pseo/pages')).json();expect(page.pagination.total).toBe(1);expect(page.pages).toHaveLength(1);const filtered=await(await get('/api/resources?level=Foundation&subject=Python&type=video')).json();expect(filtered).toEqual([]);});
 it('serves crawler files with proper MIME and inventory',async()=>{const robots=await get('/robots.txt');expect(robots.headers.get('content-type')).toContain('text/plain');expect(await robots.text()).toContain('Sitemap: https://genziitian.in/sitemap.xml');const index=await get('/sitemap.xml');expect(index.headers.get('content-type')).toContain('application/xml');expect(await index.text()).toContain('<sitemapindex');const assignments=await(await get('/sitemaps/assignments.xml')).text();expect(assignments).not.toContain('week-');const blogs=await(await get('/sitemaps/blogs.xml')).text();expect(blogs).toContain('/blog/iitm-bs-vs-iit-patna');const llms=await(await get('/llms.txt')).text();expect(llms).toContain('Not affiliated');expect(llms).not.toContain('week-1');expect(llms).not.toContain('/checkout');});
 it('returns 503 when a dependency fails',async()=>{const broken=await createPublicHttp({root:path.resolve('.'),renderer,repository:fixtureRepository({blogs:async()=>{throw new Error('DB offline')}})});const app=express();app.use(broken.document);const s=app.listen(0,'127.0.0.1');await new Promise<void>(r=>s.once('listening',r));try{const r=await fetch(`http://127.0.0.1:${(s.address() as any).port}/blog`);expect(r.status).toBe(503);expect(await r.text()).toContain('Content temporarily unavailable');}finally{await new Promise<void>(r=>s.close(()=>r()));}});
});
describe('sanitization and content catalogue',()=>{
 it('removes XSS while retaining lesson tables and disclosure content',()=>{const html=sanitize('<script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">X</a><details><summary>Answer</summary><p>≥ 85</p></details><table><tr><td>test</td></tr></table>');expect(html).not.toContain('alert');expect(html).not.toContain('onerror');expect(html).toContain('<details>');expect(html).toContain('<table>');});
 it('serializes hostile initial data safely',()=>{expect(safeJson({text:'</script><script>alert(1)</script>'})).not.toContain('</script>');});
 it('normalizes publication values and JSON columns without inventing schema',()=>{expect([true,1,'1','true'].every(isPublished)).toBe(true);expect([false,0,'0',null,'false'].some(isPublished)).toBe(false);const p=parseKnowledge({slug:'test',sections:[{heading:'Test',body:'<script>X</script><p>safe</p>'}],faq:'[]',schema_data:'{"@type":"University"}'});expect(p.sections[0].body).toBe('<p>safe</p>');expect(p.schema_data).toEqual({});});
 it('maps aliases through the shared catalogue',()=>{expect(findSubject('Foundation','Maths 1')?.subject.slug).toBe('mathematics-1');expect(findSubject('Diploma','Deep Learning & Gen AI')?.subject.slug).toBe('deep-learning-gen-ai');expect(findSubject('Foundation','invented')).toBeNull();});
 it('has populated source material only for actual weeks',()=>{expect(gradedAssignments.map(a=>a.week)).toEqual(['Week 1','Week 2','Week 3','Week 5','Week 6']);expect(gradedAssignments.every(a=>a.questions.length>0)).toBe(true);});
});
