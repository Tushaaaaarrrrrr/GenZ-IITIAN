export const SITE = 'https://genziitian.in';
export const BRAND = 'GenZ IITian';
const common = [
  ['Maths 1','mathematics-1','Mathematics 1'], ['Stats 1','statistics-1','Statistics 1'],
  ['Maths 2','mathematics-2','Mathematics 2'], ['Stats 2','statistics-2','Statistics 2'],
  ['English 1','english-1','English 1'], ['English 2','english-2','English 2'],
  ['Python','python','Python'], ['CT','computational-thinking','Computational Thinking'],
];
const diploma = ['MLF','BDM','MLT','MLP','TDS','DBMS','Java','PDSA','MAD 1','MAD 2','BA','Deep Learning & Gen AI','System Commands'];
export const catalogue = [
  { key: 'Qualifier', slug: 'qualifier', subjects: common.filter(x => ['Maths 1','Stats 1','English 1','CT'].includes(x[0])) },
  { key: 'Foundation', slug: 'foundation', subjects: common },
  { key: 'Diploma', slug: 'diploma', subjects: diploma.map(key => [key,
    key === 'Deep Learning & Gen AI' ? 'deep-learning-gen-ai' : key.toLowerCase().replaceAll(' ', '-'), key]) },
].map(level => ({...level, subjects: level.subjects.map(([key,slug,name]) => ({key,slug,name}))}));
export function findSubject(level: string, subject: string) {
  const l = catalogue.find(l => l.slug === level.toLowerCase());
  const aliases = (value: string) => value.toLowerCase().replaceAll('&', 'and').replace(/[^a-z0-9]/g, '');
  const s = l?.subjects.find(s => [s.key,s.slug,s.name].some(v => aliases(v) === aliases(subject)));
  return l && s ? {level:l, subject:s} : null;
}
export const resourcePath = (level: string, subject: string) => {
  const match = findSubject(level, subject);
  return match ? `/iitm-bs/resources/${match.level.slug}/${match.subject.slug}` : null;
};
export const assignmentBase = '/iitm-bs/graded-assignment/foundation/computational-thinking';
export const assignmentPath = (week: number) => `${assignmentBase}/week-${week}`;
export const publicPrefixes = ['/iitm-bs','/resources','/graded-assignment','/blog','/docs','/knowledge','/about','/contact'];
export function isPublicPath(path: string) { return path === '/' || publicPrefixes.some(p => path === p || path.startsWith(p+'/')); }
export const applicationRoutes: [RegExp,string,boolean][] = [
  [/^\/courses(?:\/[^/]+)?$/, 'Courses', false],
  [/^\/(?:checkout\/[^/]+|cart|profile|refer|manager(?:\/.*)?|access-pdf|verify|employee\/policy|payment-success|payment-failed)$/, 'Your account', true],
  [/^\/tools\/(?:cgpa-calculator|grade-predictor|grading-scale)$/, 'IITM BS study tools', false],
  [/^\/(?:one-to-one|1-on-1|menu|ecosystem|syllabus|careers|newsletter|terms|privacy|refund)$/, 'GenZ IITian', false],
  [/^\/(?:401|403|404|500|503|error\/(?:401|403|404|500|503))$/, 'Page unavailable', true],
];
export function applicationRoute(path: string) { return applicationRoutes.find(([r]) => r.test(path)); }

export function migrateResourceLink(value:string) {
  if(value.startsWith('//'))return value;
  try {const url=new URL(value,SITE);if(url.origin!==SITE)return value;
    const p=decodeURIComponent(url.pathname).replace(/\/+$/,'');
    const parts=p.match(/^\/resources\/([^/]+)\/([^/]+)$/);
    const target=p==='/resources'?'/iitm-bs/resources':p==='/graded-assignment'?'/iitm-bs/graded-assignment':parts?resourcePath(parts[1],parts[2]):null;
    return target?target+url.search+url.hash:value;
  }catch{return value;}
}
