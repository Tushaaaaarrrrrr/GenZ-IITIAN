import {hydrateRoot} from 'react-dom/client';
import PublicApp from './PublicApp';
import {applyMetadata} from './metadata';
import type {PublicData} from './types';
export function hydratePublic(data:PublicData) {
  applyMetadata(data.seo);
  hydrateRoot(document.getElementById('root')!,<PublicApp data={data}/>);
  // Same storage key/expiry as the existing campaign. Never import private loaders.
  const ref=new URLSearchParams(window.location.search).get('ref');
  if(ref) {try{localStorage.setItem('ref_code',JSON.stringify({code:ref.trim().toUpperCase(),expires:Date.now()+24*60*60*1000}));}catch{}}
}
