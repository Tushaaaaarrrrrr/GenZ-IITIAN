import fs from 'node:fs';
import crypto from 'node:crypto';
const baseline=JSON.parse(fs.readFileSync('seo-baseline.json','utf8'));
const protectedFiles=Object.keys(baseline.files);
const failures=protectedFiles.filter(file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==baseline.files[file]);
if(failures.length)throw new Error('Protected files changed: '+failures.join(', '));
console.log(`Campaign verification passed: ${protectedFiles.length} protected files unchanged from ${baseline.source_commit}.`);

const recorded=JSON.parse(fs.readFileSync('content/campaign-baseline.json','utf8'));
const server=fs.readFileSync('server/index.js','utf8');
for(const expected of recorded.server_segments){
  const start=server.indexOf(expected.start),end=server.indexOf(expected.end);
  if(start<0||end<=start)throw new Error('Protected API boundary missing');
  if(crypto.createHash('sha256').update(server.slice(start,end)).digest('hex')!==expected.sha256)throw new Error('Payment/enrolment/referral API handlers changed');
}
console.log('Payment, enrolment and referral API handlers unchanged.');
