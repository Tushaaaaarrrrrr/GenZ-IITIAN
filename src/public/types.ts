import type {Descriptor} from './metadata';
import type {BlogPost} from '../data/blogsData';
import type {StaticResource} from '../data/staticNotes';
import type {GradedAssignmentContent} from '../data/gradedAssignments';
import type {DocEntry} from '../data/docsData';
export type Resource = StaticResource & {updated_at?:string};
export type Knowledge = {slug:string;title:string;h1?:string;meta_description?:string;introduction?:string;sections?:{heading:string;body:string}[];faq?:{question:string;answer:string}[];internal_links?:{url:string;text:string}[];updated_at?:string};
export type PublicData = {
  redirectPath?:string;kind:string;status:number;seo:Descriptor;path:string;query?:string;
  blogs?:BlogPost[];blog?:BlogPost;resources?:Resource[];level?:string;subject?:string;subjectName?:string;
  assignment?:GradedAssignmentContent;review?:{status:string;reviewed_at?:string;note:string};weeks?:number[];
  docs?:DocEntry[];doc?:DocEntry;knowledge?:Knowledge;pages?:Knowledge[];related?:Knowledge[];
  categories?:string[];
  pagination?:{page:number;totalPages:number;total:number};
};
