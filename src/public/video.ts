export function youtubeEmbed(value:string):string | null {
 try {const u=new URL(value);let id:string|null=null;
 if(['www.youtube.com','youtube.com','m.youtube.com'].includes(u.hostname))id=u.searchParams.get('v')||(u.pathname.startsWith('/embed/')?u.pathname.slice(7):u.pathname.startsWith('/shorts/')?u.pathname.slice(8):null);
 if(u.hostname==='youtu.be')id=u.pathname.slice(1);
 return id&&/^[a-zA-Z0-9_-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}`:null;
 }catch{return null;}
}
