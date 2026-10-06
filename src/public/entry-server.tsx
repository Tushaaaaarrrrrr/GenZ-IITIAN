import {renderToString} from 'react-dom/server';
import PublicApp from './PublicApp';
export {loadPublic,unavailable,mergedResources} from './load';
export {metadataHtml,descriptor,safeJson} from './metadata';
export * from './catalogue';
export {approvedWeeks,assignmentReviews} from './assignment-review';
export {docsData} from '../data/docsData';
import type {PublicData} from './types';
export function render(data:PublicData) {return renderToString(<PublicApp data={data}/>);}
