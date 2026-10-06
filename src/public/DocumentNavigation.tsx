import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
export default function DocumentNavigation() {
  const {pathname,search,hash}=useLocation();
  useEffect(()=>{window.location.assign(pathname+search+hash);},[pathname,search,hash]);
  return <p className="p-8">Opening page… <a href={pathname+search+hash}>Continue</a></p>;
}
