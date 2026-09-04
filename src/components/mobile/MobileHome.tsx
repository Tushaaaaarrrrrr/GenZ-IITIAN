import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Play, Flame } from 'lucide-react';

const ECO_TAGS = [
  'Daily Live', 'Recorded', 'Weekly Mock Test', 'Live Doubts',
  'Graded Practice', 'Assignments', 'Imp Ques', 'Curated',
];

function Chip({ label, bg, glyph, className }: { label: string; bg: string; glyph: string; className: string }) {
  return (
    <div className={`absolute flex items-center gap-1.5 bg-white border-[2.5px] border-[#0b1120] rounded-xl pl-1.5 pr-2.5 py-1.5 shadow-[2px_2px_0px_#0b1120] ${className}`}>
      <span className="w-6 h-6 rounded-md flex items-center justify-center text-white font-black text-xs" style={{ background: bg }}>{glyph}</span>
      <span className="font-black text-[11.5px] text-[#0b1120]">{label}</span>
    </div>
  );
}

function HeroArt() {
  return (
    <div className="relative h-[250px] my-1.5">
      {/* backdrop circle */}
      <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[214px] h-[214px] rounded-full bg-[#fee2e2] border-[2.5px] border-[#0b1120]" />
      {/* welcome card */}
      <div className="absolute top-[78px] left-1/2 -translate-x-1/2 w-[175px] bg-[#0f172a] border-[2.5px] border-red-500 rounded-2xl shadow-[3px_3px_0px_#0b1120] px-3 pt-3.5 pb-3 text-center text-white">
        <div className="font-black text-[10px] text-red-400 tracking-wider uppercase">END TERM 2026</div>
        <div className="font-black text-[17px] leading-tight text-white mt-0.5">NOW OR NEVER</div>
        <div className="text-[9px] font-bold text-amber-300 mt-1 border-t border-white/20 pt-1.5">10 Days Left &bull; 13 Sept</div>
        <div className="mx-auto mt-2 w-[26px] h-[26px] rounded-full bg-red-600 flex items-center justify-center text-white">
          <Flame className="w-3.5 h-3.5 fill-current" />
        </div>
      </div>
      <Chip label="MAY'26 ENDTERM" bg="#DC2626" glyph="🔥" className="top-1.5 left-0" />
      <Chip label="Target S" bg="#15B981" glyph="S" className="top-3.5 right-0.5" />
      <Chip label="High Yield" bg="#F6A623" glyph="⚡" className="bottom-[30px] left-1.5" />
      <Chip label="Full Mocks" bg="#2563EB" glyph="📝" className="bottom-2 right-1" />
    </div>
  );
}

function StatCard({ value, label, fill }: { value: string; label: string; fill?: boolean }) {
  return (
    <div className={`flex-1 rounded-2xl border-[2.5px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] px-3 py-4 text-center ${fill ? 'bg-[#15B981]' : 'bg-white'}`}>
      <div className={`text-[28px] font-black leading-none ${fill ? 'text-white' : 'text-[#0b1120]'}`}>{value}</div>
      <div className={`text-[9.5px] font-black tracking-wider mt-1.5 ${fill ? 'text-white/90' : 'text-gray-500'}`}>{label}</div>
    </div>
  );
}

/** Mobile-only Home screen matching the Gen-Z IITian mobile design. */
export default function MobileHome() {
  return (
    <div className="md:hidden">
      <div className="px-4 pt-5 pb-2">
        <h1 className="font-black text-[30px] leading-[1.1] text-[#0b1120]">
          ENDTERM CRASH COURSE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-amber-500">
            IS NOW LIVE
          </span>
        </h1>

        <p className="mt-2.5 text-[14px] leading-relaxed text-gray-700 font-bold">
          10 days to 13 Sept. Cut through the noise—master high-weightage topics, practice PYQs, and take timed mock tests for your S-Grade.
        </p>

        <Link
          to="/courses?exam=End+Term"
          className="mt-4 w-full flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl border-[2.5px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] py-[15px] text-[15px] font-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0b1120] transition-all"
        >
          <Flame className="w-4 h-4 fill-current" /> GET ENDTERM CRASH COURSE <ChevronRight className="w-4 h-4" />
        </Link>
        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          <a
            href="https://chat.whatsapp.com/Gi4D9yAd99p7q1XeVh0J1e"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white text-[#0b1120] rounded-xl border-[2.5px] border-[#0b1120] shadow-[3px_3px_0px_#0b1120] py-[13px] text-[13.5px] font-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0b1120] transition-all"
          >
            <span className="w-[18px] h-[18px] rounded-full bg-green-500 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            </span>
            WhatsApp
          </a>
          <a
            href="https://youtube.com/@Gen-ZIITian/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white text-[#0b1120] rounded-xl border-[2.5px] border-[#0b1120] shadow-[3px_3px_0px_#0b1120] py-[13px] text-[13.5px] font-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0b1120] transition-all"
          >
            <span className="w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
            </span>
            YouTube
          </a>
        </div>

        <HeroArt />

        <div className="flex gap-2.5 mt-1.5">
          <StatCard value="15.4K+" label="YT SUBSCRIBERS" />
          <StatCard value="3439+" label="STUDENTS" fill />
          <StatCard value="43" label="IIT COURSES" />
        </div>
      </div>

      <div className="px-4 pt-3.5 pb-2">
        <div className="bg-[#15B981] border-[2.5px] border-[#0b1120] rounded-[20px] shadow-[4px_4px_0px_#0b1120] px-[18px] py-[22px] text-white">
          <h2 className="font-black text-[27px] leading-tight">Experience the Powerful &amp; Best Ecosystem</h2>
          <p className="mt-3 mb-4 text-[13.5px] leading-relaxed font-semibold text-white/90">
            See how our platform simplifies complex concepts and helps you ace your exams with ease.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {ECO_TAGS.map((t) => (
              <span key={t} className="bg-white border-2 border-[#0b1120] rounded-full px-3.5 py-1.5 font-bold text-xs text-[#0b1120]">{t}</span>
            ))}
          </div>
        </div>

        <div
          className="mt-[18px] bg-[#0b1120] border-[2.5px] border-[#0b1120] rounded-[20px] shadow-[4px_4px_0px_#15B981] px-[18px] py-6 text-white"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        >
          <h2 className="font-black text-[27px] leading-tight">Personally mentoring India's next top engineers</h2>
          <p className="mt-3.5 text-[13.5px] leading-relaxed font-medium text-white/60">
            Taking you from basics to advanced through practical learning and real-world problem solving.
          </p>
        </div>
      </div>
    </div>
  );
}
