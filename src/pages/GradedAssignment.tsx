import { useMemo, useState } from 'react';
import { ChevronDown, FileText, Code2, ListChecks, Lightbulb } from 'lucide-react';
import {
  gradedAssignments,
  type GradedBlock,
  type GradedQuestion,
} from '../data/gradedAssignments';

const levelSubjects: Record<string, string[]> = {
  Foundation: ['Maths 1', 'Stats 1', 'Maths 2', 'Stats 2', 'English 1', 'English 2', 'Python', 'CT'],
  Diploma: ['MLF', 'BDM', 'MLT', 'MLP', 'TDS', 'DBMS', 'Java', 'PDSA', 'MAD 1', 'MAD 2', 'BA', 'Deep Learning & Gen AI', 'System Commands'],
};

const weeks = Array.from({ length: 12 }, (_, index) => `Week ${index + 1}`);

export default function GradedAssignment() {
  const [selectedLevel, setSelectedLevel] = useState<'Foundation' | 'Diploma'>('Foundation');
  const [selectedSubject, setSelectedSubject] = useState<string>(levelSubjects.Foundation[0]);
  const [selectedWeek, setSelectedWeek] = useState<string>('Week 1');

  const subjects = useMemo(() => levelSubjects[selectedLevel], [selectedLevel]);

  const content = useMemo(
    () => gradedAssignments.find(
      g => g.level === selectedLevel && g.subject === selectedSubject && g.week === selectedWeek
    ),
    [selectedLevel, selectedSubject, selectedWeek]
  );

  const weeksWithContent = useMemo(() => {
    const set = new Set<string>();
    for (const g of gradedAssignments) {
      if (g.level === selectedLevel && g.subject === selectedSubject) set.add(g.week);
    }
    return set;
  }, [selectedLevel, selectedSubject]);

  const handleLevelChange = (level: 'Foundation' | 'Diploma') => {
    setSelectedLevel(level);
    setSelectedSubject(levelSubjects[level][0]);
    setSelectedWeek('Week 1');
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-[#10b981] mb-1">Resources</p>
        <h1 className="text-3xl md:text-4xl font-black text-[#0b1120] tracking-tight">Graded Assignment</h1>
        <p className="mt-2 text-gray-600 font-medium max-w-3xl text-sm">
          Choose your level, subject, and week to view graded assignment questions. Click each question card to expand pseudocode and solution.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="mb-8 p-5 bg-gray-50 border-[3px] border-[#0b1120] rounded-2xl shadow-[5px_5px_0px_#0b1120]">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            <div className="flex flex-wrap gap-3">
              {(['Foundation', 'Diploma'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level)}
                  className={`px-4 py-2 rounded-xl border-[3px] border-[#0b1120] text-xs font-black transition-all hover:-translate-y-0.5 ${selectedLevel === level ? 'bg-[#10b981] text-white shadow-[3px_3px_0px_#0b1120]' : 'bg-white text-[#0b1120] shadow-[2px_2px_0px_#0b1120]'}`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="w-full lg:w-96">
              <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-1.5">Subject</label>
              <select
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
                className="w-full px-3.5 py-2.5 border-[3px] border-[#0b1120] rounded-xl bg-white text-[#0b1120] font-bold text-sm focus:outline-none"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          <aside className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-4 shadow-[4px_4px_0px_#0b1120] lg:sticky lg:top-24">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-3">Weeks</h2>
            <div className="space-y-2">
              {weeks.map((week) => {
                const hasContent = weeksWithContent.has(week);
                return (
                  <button
                    key={week}
                    onClick={() => setSelectedWeek(week)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border-[2px] border-[#0b1120] text-xs font-bold transition-all ${selectedWeek === week ? 'bg-[#0b1120] text-white shadow-[2px_2px_0px_#10b981]' : 'bg-white text-[#0b1120] hover:bg-gray-100'}`}
                  >
                    <span>{week}</span>
                    {hasContent && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#10b981]"
                        title="Content available"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 text-[10px] font-black">
                {selectedLevel}
              </span>
              <span className="px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-black">
                {selectedSubject}
              </span>
              <span className="px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-black">
                {selectedWeek}
              </span>
              {content && (
                <span className="px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-600 text-[10px] font-black">
                  {content.questions.length} question{content.questions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {content ? (
              <>
                <div className="space-y-5">
                  {content.questions.map((q) => (
                    <QuestionCard key={q.number} question={q} />
                  ))}
                </div>

                <p className="text-[10px] text-gray-400 font-medium mt-6">
                  Extracted from the official CS1001 assignments PDF.
                </p>
              </>
            ) : (
              <div className="bg-white border-[3px] border-dashed border-gray-300 rounded-2xl p-8 text-center">
                <FileText className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-bold text-sm">Coming soon</p>
                <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                  Graded assignment for {selectedSubject} — {selectedWeek} hasn't been added yet. Watch for the green dot in the sidebar to spot weeks with content.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Question card with collapsible solution
// ============================================================================

function QuestionCard({ question }: { question: GradedQuestion }) {
  const [solutionOpen, setSolutionOpen] = useState(false);

  // Split solution blocks from everything else so we can collapse them
  const mainBlocks = question.blocks.filter(b => b.kind !== 'solution');
  const solutionBlocks = question.blocks.filter(b => b.kind === 'solution');

  return (
    <article className="bg-white border-[3px] border-[#0b1120] rounded-2xl shadow-[5px_5px_0px_#0b1120] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 bg-gradient-to-r from-[#0b1120] to-[#1e293b]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 w-9 h-9 rounded-xl bg-[#10b981] text-white text-sm font-black flex items-center justify-center border-2 border-white/20">
            {question.number}
          </span>
          <h3 className="text-white font-black text-base leading-tight">
            Question {question.number}
          </h3>
        </div>
        {question.points && (
          <span className="shrink-0 px-2.5 py-1 rounded-full border border-amber-300/40 bg-amber-400/20 text-amber-200 text-[10px] font-black uppercase tracking-wider">
            {question.points}
          </span>
        )}
      </div>

      {/* Prompt */}
      {question.prompt && (
        <div className="px-5 pt-5 pb-2">
          <p className="text-[#0b1120] font-bold text-sm leading-relaxed">{question.prompt}</p>
        </div>
      )}

      {/* Main blocks (prose, code, options) */}
      <div className="px-5 pb-5 space-y-3">
        {mainBlocks.map((block, idx) => (
          <BlockRenderer key={idx} block={block} />
        ))}
      </div>

      {/* Collapsible solution */}
      {solutionBlocks.length > 0 && (
        <div className="border-t-[3px] border-[#0b1120]">
          <button
            onClick={() => setSolutionOpen(o => !o)}
            className={`w-full flex items-center justify-between px-5 py-3 text-xs font-black uppercase tracking-wider transition-colors ${solutionOpen ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-700 hover:bg-amber-50 hover:text-amber-700'}`}
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5" />
              {solutionOpen ? 'Hide solution' : 'Show solution'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${solutionOpen ? 'rotate-180' : ''}`} />
          </button>
          {solutionOpen && (
            <div className="px-5 py-5 bg-amber-50/40 border-t-[2px] border-amber-200 space-y-3">
              {solutionBlocks.map((block, idx) => (
                <BlockRenderer key={idx} block={block} solution />
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ============================================================================
// Block renderer — prose, code, options
// ============================================================================

function BlockRenderer({ block, solution = false }: { block: GradedBlock; solution?: boolean }) {
  if (block.kind === 'code') {
    return (
      <div className="rounded-xl border-2 border-[#0b1120] bg-[#0b1120] overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] border-b border-[#10b981]/30">
          <Code2 className="w-3 h-3 text-[#10b981]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#10b981]">Pseudocode</span>
        </div>
        <pre className="px-4 py-3 text-[12px] leading-relaxed font-mono text-[#e2e8f0] overflow-x-auto whitespace-pre">
          {block.text}
        </pre>
      </div>
    );
  }

  if (block.kind === 'options') {
    return (
      <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <ListChecks className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Options</span>
        </div>
        <ul className="space-y-1.5">
          {(block.items || []).map((item, i) => (
            <li key={i} className="text-sm text-[#0b1120] font-medium leading-relaxed pl-2">
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // prose or solution
  return (
    <p className={`text-sm leading-relaxed ${solution ? 'text-amber-900' : 'text-gray-700'} font-medium`}>
      {block.text}
    </p>
  );
}
