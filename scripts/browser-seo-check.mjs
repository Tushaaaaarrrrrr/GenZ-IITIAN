// Read-only fixture browser checks. Requires Playwright and its Chromium runtime.
import fs from 'node:fs/promises';
const playwright = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await playwright.chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
const context=await browser.newContext({viewport:{width:1365,height:950}});
const campaign={id:'campaign-course',name:'Campaign Fixture Course',description:'A mocked campaign course',subject:'CT',term:'Foundation',price:1234,discountPrice:999,active:true,isBundle:false,lms_course_id:'fixture-lms'};
const mutations=[];
await context.route('**/*',async route=>{const req=route.request();const u=new URL(req.url());
 if(req.method()==='POST'&&/create-order|verify-payment|auto-enroll|webhook/.test(u.pathname)){mutations.push(u.pathname);return route.abort();}
 if(u.hostname==='placeholder-url.supabase.co'&&u.pathname==='/rest/v1/courses')return route.fulfill({contentType:'application/json',body:JSON.stringify(req.headers().accept?.includes('object')?campaign:[campaign])});
 if(u.hostname!=='127.0.0.1')return route.abort();await route.continue();});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/hydrat|mismatch|Minified React/i.test(m.text()))errors.push(m.text());});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3100';
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
await page.goto(base+'/iitm-bs/resources?ref=AB123&utm_campaign=test');await page.getByLabel('Level',{exact:true}).selectOption('foundation');
assert(await page.getByRole('heading',{name:'Foundation',exact:true}).count()===1,'Level selector failed');assert(await page.getByRole('heading',{name:'Qualifier',exact:true}).count()===0,'Qualifier was not filtered');
assert(JSON.parse(await page.evaluate(()=>localStorage.getItem('ref_code'))).code==='AB123','Referral capture changed');
await page.getByLabel('Find a subject').fill('Computational');assert(await page.locator('.public-card').count()===1,'Subject search failed');
await page.locator('.public-card').click();await page.waitForURL('**/iitm-bs/resources/foundation/computational-thinking');
await page.getByRole('button',{name:'Notes',exact:true}).click();assert(await page.getByRole('button',{name:'Notes',exact:true}).getAttribute('aria-pressed')==='true','Resource tab failed');
await fs.mkdir('review/browser',{recursive:true});await page.screenshot({path:'review/browser/resources-desktop.png',fullPage:true});
await page.goto(base+'/iitm-bs/graded-assignment/foundation/computational-thinking/week-1');await page.locator('summary').first().click();assert(await page.locator('details').first().getAttribute('open')!==null,'Assignment disclosure failed');
await page.goto(base+'/blog/iitm-bs-vs-iit-patna');assert(await page.locator('h1').textContent()==='IITM BS vs IIT Patna CSDA: an evidence-based comparison','Article missing');await page.screenshot({path:'review/browser/comparison-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.goto(base+'/iitm-bs/resources');await page.screenshot({path:'review/browser/resources-mobile.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Mobile page overflows');
await page.goto(base+'/blog/iitm-bs-vs-iit-patna');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Comparison table overflows mobile page');
// Verify navigation crosses from the SSR tree to the unchanged transaction app.
await page.getByRole('link',{name:'Courses',exact:true}).click();await page.waitForURL('**/courses');assert(await page.locator('#public-data').count()===0,'Course page did not enter transaction app');
await page.setViewportSize({width:1365,height:950});
await page.goto(base+'/courses/campaign-course?ref=AB123&utm_campaign=test');await page.getByRole('heading',{name:'Campaign Fixture Course',exact:true}).waitFor();
const checkout=page.getByRole('link',{name:'Enroll Now',exact:true});assert(await checkout.getAttribute('href')==='/checkout/campaign-fixture-course?courseId=campaign-course','Checkout destination changed');
await checkout.click();await page.waitForURL('**/checkout/campaign-fixture-course?courseId=campaign-course');
assert((await page.locator('body').innerText()).includes('Campaign Fixture Course'),'Checkout did not load the recorded courseId');
await page.evaluate(course=>localStorage.setItem('cart',JSON.stringify([course])),campaign);await page.goto(base+'/cart');await page.getByText('Campaign Fixture Course',{exact:true}).first().waitFor();
assert(mutations.length===0,'Unexpected real transaction request');
assert(errors.length===0,'Browser errors: '+errors.join('; '));
await fs.writeFile('review/browser/results.json',JSON.stringify({passed:true,checks:['hydration','level selector','subject search','resource tabs','assignment disclosure','article content','mobile overflow','referral capture','course document navigation','mock course detail','checkout courseId lookup','cart persistence','no real payment or enrolment requests'],errors},null,2));
console.log('Browser checks passed.');await browser.close();
