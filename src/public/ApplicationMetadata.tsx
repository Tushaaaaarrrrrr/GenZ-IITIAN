import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {applicationRoute} from './catalogue';
import {applyMetadata,descriptor} from './metadata';
const names:Record<string,string>={'/tools/cgpa-calculator':'IITM BS CGPA calculator','/tools/grade-predictor':'IITM BS grade predictor','/tools/grading-scale':'IITM BS grading scale','/terms':'Terms and conditions','/privacy':'Privacy policy','/refund':'Refund policy','/newsletter':'Newsletter','/careers':'Careers','/syllabus':'IITM BS syllabus','/menu':'Explore GenZ IITian','/ecosystem':'GenZ IITian ecosystem','/one-to-one':'One-to-one mentorship','/1-on-1':'One-to-one mentorship'};
export default function ApplicationMetadata() {
  const {pathname,search}=useLocation();
  useEffect(()=>{
    // Campaign pages continue to own their metadata during this release.
    if(pathname.startsWith('/courses'))return;
    const route=applicationRoute(pathname);if(!route)return;
    const title=names[pathname]||route[1];
    const filter=[...new URLSearchParams(search).keys()].some(k=>!['ref','gclid','fbclid','msclkid','courseId'].includes(k)&&!k.startsWith('utm_'));
    applyMetadata(descriptor({path:pathname,title:`${title} | GenZ IITian`,description:`${title} on GenZ IITian.`,noindex:route[2]||filter}));
  },[pathname,search]);return null;
}
