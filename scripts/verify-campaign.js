import fs from 'node:fs';
import crypto from 'node:crypto';
const baseline=JSON.parse(fs.readFileSync('seo-baseline.json','utf8'));
const protectedFiles=['src/pages/Courses.tsx','src/pages/CourseDetail.tsx','src/pages/CourseSelection.tsx','src/pages/Cart.tsx','src/pages/PaymentSuccess.tsx','src/pages/PaymentFailed.tsx','src/components/CourseCard.tsx','src/context/AuthContext.tsx','src/context/CartContext.tsx','src/utils/courseRouting.ts','src/lib/referral.ts','src/lib/api.ts'];
const failures=protectedFiles.filter(file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==baseline.files[file]);
if(failures.length)throw new Error('Protected files changed: '+failures.join(', '));
console.log(`Campaign verification passed: ${protectedFiles.length} protected files unchanged from ${baseline.source_commit}.`);

const recorded=JSON.parse(fs.readFileSync('content/campaign-baseline.json','utf8'));
const server=fs.readFileSync('server/index.js','utf8');const section=server.slice(server.indexOf(recorded.server_span_start),server.indexOf(recorded.server_span_end));
if(crypto.createHash('sha256').update(section).digest('hex')!==recorded.sha256)throw new Error('Payment/enrolment/referral API span changed');
console.log('Payment, enrolment and referral API handler span unchanged.');
