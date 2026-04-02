import { useMemo, useState } from 'react';

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
          Choose your level, subject, and week to view graded assignment questions. Weekly questions can be added here anytime.
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
              {weeks.map((week) => (
                <button
                  key={week}
                  onClick={() => setSelectedWeek(week)}
                  className={`w-full text-left px-3 py-2 rounded-xl border-[2px] border-[#0b1120] text-xs font-bold transition-all ${selectedWeek === week ? 'bg-[#0b1120] text-white shadow-[2px_2px_0px_#10b981]' : 'bg-white text-[#0b1120] hover:bg-gray-100'}`}
                >
                  {week}
                </button>
              ))}
            </div>
          </aside>

          <div className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-6 shadow-[6px_6px_0px_#0b1120] min-h-[430px]">
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
            </div>

            <h3 className="text-xl font-black text-[#0b1120] mb-1.5">Questions</h3>
            <p className="text-gray-600 font-medium mb-6 text-sm">
              Add graded assignment questions for {selectedSubject} in {selectedWeek} here.
            </p>

            <div className="border-[3px] border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50">
              <p className="text-gray-500 font-bold text-sm">No questions added yet.</p>
              <p className="text-xs text-gray-400 mt-2">Once you add questions, this section will show the full list for the selected week.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}