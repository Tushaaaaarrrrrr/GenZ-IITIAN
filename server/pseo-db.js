// Compatibility for the existing generator/admin code. Public reads use the
// explicit public repository in server/public/content.js.
import {supabase} from './supabase.js';
const jsonColumns=new Set(['sections','faq','secondary_keywords','internal_links','related_pages','schema_data','error_log']);
const tables=new Set(['pseo_pages','pseo_datasets','pseo_clusters','pseo_generation_log']);
function client(){if(!supabase)throw new Error('Content database unavailable');return supabase;}
function tableOf(sql){const m=sql.match(/(?:FROM|INTO|UPDATE)\s+(pseo_\w+)/i);if(!m||!tables.has(m[1]))throw new Error('Unsupported content operation');return m[1];}
function convert(column,value){if(column==='published'||column==='active')return value===1||value===true||value==='1';if(jsonColumns.has(column)&&typeof value==='string'){try{return JSON.parse(value);}catch{throw new Error('Invalid JSON in '+column);}}return value;}
function split(value){let depth=0;let quote=false;let chunks=[];let start=0;for(let i=0;i<value.length;i++){if(value[i]==="'")quote=!quote;if(!quote){if(value[i]==='(')depth++;if(value[i]===')')depth--;if(value[i]===','&&depth===0){chunks.push(value.slice(start,i).trim());start=i+1;}}}chunks.push(value.slice(start).trim());return chunks;}
function bound(sql,params,index){const field=(sql.slice(0,index).match(/\?/g)||[]).length;return params[field];}
function filters(query,sql,params){const clause=sql.match(/WHERE\s+([\s\S]*?)(?:ORDER BY|GROUP BY|LIMIT|$)/i)?.[1]||'';
  const offset=sql.indexOf(clause);
  if(/\bOR\b/.test(clause))throw new Error('Legacy OR queries must use the explicit content repository');
  for(const m of clause.matchAll(/\b([a-z_]+)\s*(=|!=)\s*(\?|1|0)/g)){
    const [,field,operator,token]=m;if(field==='1')continue;const value=convert(field,token==='?'?bound(sql,params,offset+m.index+m[0].indexOf('?')):Number(token));query=operator==='!='?query.neq(field,value):query.eq(field,value);
  }
  return query;
}
async function read(sql,params=[],single=false){const table=tableOf(sql);const count=/COUNT\(\*\)/i.test(sql);let query=client().from(table).select(count?'*':sql.match(/^\s*SELECT\s+([\s\S]+?)\s+FROM/i)?.[1].trim()||'*',count?{count:'exact',head:true}:{});query=filters(query,sql,params);
  for(const m of sql.matchAll(/ORDER BY\s+(\w+)(?:\s+(ASC|DESC))?/gi)){if(m[1]!=='RANDOM')query=query.order(m[1],{ascending:m[2]!=='DESC'});}
  const limit=sql.match(/LIMIT\s+(\?|\d+)(?:\s+OFFSET\s+(\?|\d+))?/i);
  if(limit){const amount=limit[1]==='?'?Number(bound(sql,params,limit.index+limit[0].indexOf('?'))):Number(limit[1]);const start=limit[2]==='?'?Number(params.at(-1)):Number(limit[2]||0);query=query.range(start,start+amount-1);}
  if(single&&!count)query=query.limit(1).maybeSingle();const {data,error,count:total}=await query;if(error)throw error;return count?{count:total||0,total:total||0}:data;
}
async function write(sql,params=[]){const table=tableOf(sql);let query;
 if(/^\s*INSERT/i.test(sql)){
   const m=sql.match(/\(([^]+?)\)\s*VALUES\s*\(([^]+)\)/i);if(!m)throw new Error('Unsupported insert');const columns=split(m[1]);const tokens=split(m[2]);let n=0;const payload={};columns.forEach((col,i)=>{const token=tokens[i];let value;if(token==='?')value=params[n++];else if(/datetime\('now'\)/i.test(token))value=new Date().toISOString();else if(/^'.*'$/.test(token))value=token.slice(1,-1);else if(/^\d+$/.test(token))value=Number(token);else throw new Error('Unsupported insert value');payload[col]=convert(col,value);});
   const {data,error}=await client().from(table).insert(payload).select('id').single();if(error)throw error;return {lastID:data.id,changes:1};
 }
 if(/^\s*UPDATE/i.test(sql)){
   const set=sql.match(/SET\s+([\s\S]+?)\s+WHERE/i);if(!set)throw new Error('Refusing update without a filter');const payload={};let n=0;
   for(const assignment of split(set[1])){const m=assignment.match(/^(\w+)\s*=\s*([\s\S]+)$/);if(!m)throw new Error('Unsupported assignment');const [,col,expr]=m;if(expr==='?')payload[col]=convert(col,params[n++]);else if(/^COALESCE\(\?/i.test(expr)){const value=params[n++];if(value!=null)payload[col]=convert(col,value);}else if(/datetime\('now'\)/i.test(expr))payload[col]=new Date().toISOString();else if(/^[01]$/.test(expr))payload[col]=convert(col,Number(expr));else throw new Error('Unsupported update expression');}
   query=filters(client().from(table).update(payload),sql,params);
 }else if(/^\s*DELETE/i.test(sql)){if(!/WHERE\s+id\s*=\s*\?/i.test(sql))throw new Error('Refusing unfiltered delete');query=client().from(table).delete().eq('id',params[0]);}
 else throw new Error('Unsupported write');
 const {data,error}=await query.select('id');if(error)throw error;return {changes:data?.length||0};
}
export default {getAsync:(sql,params)=>read(sql,params,true),allAsync:(sql,params)=>read(sql,params),runAsync:write};
