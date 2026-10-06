// Promotion to reviewed requires question-by-question comparison with the supplied
// PDF, including every operator, table, diagram and worked answer. Never infer a term.
export const assignmentReviews: Record<number,{status:'review'|'reviewed';reviewed_at?:string;note:string}> = Object.fromEntries([1,2,3,5,6].map(week=>[week,{
  status:'review' as const,
  note:'Archive of unknown term/year. Operators have been re-extracted from the supplied PDF. A complete question-by-question review is still required. The Week 1 source references a flowchart and procedures it does not reproduce; missing figures must not be reconstructed by guessing.',
}]));
export const approvedWeeks = () => Object.entries(assignmentReviews).filter(([,r])=>r.status==='reviewed').map(([w])=>Number(w));
