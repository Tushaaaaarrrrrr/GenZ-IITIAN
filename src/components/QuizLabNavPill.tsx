const QUIZ_URL = 'https://quiz.genziitian.in/';

const CSS = `
.qlnp{position:relative;display:inline-flex;align-items:center;gap:8px;padding:4px 14px 4px 5px;border-radius:999px;overflow:hidden;isolation:isolate;
  background:linear-gradient(135deg,#052e1f 0%,#0b3b2a 55%,#0b1120 100%);
  border:2px solid #0b1120;box-shadow:0 0 0 1px rgba(52,211,153,.55),2px 2px 0 #0b1120;
  color:#fff;font-weight:900;font-size:14px;letter-spacing:.01em;white-space:nowrap;text-decoration:none;
  transition:transform .18s ease,box-shadow .18s ease}
.qlnp:hover{transform:translateY(-1px);box-shadow:0 0 0 1px rgba(52,211,153,.9),3px 3px 0 #0b1120}
.qlnp:focus-visible{outline:3px solid #10b981;outline-offset:3px}
.qlnp-logo{width:26px;height:26px;border-radius:50%;object-fit:cover;flex:none;box-shadow:0 0 0 1.5px rgba(52,211,153,.8),0 0 10px rgba(16,185,129,.6);animation:qlnp-bob 3.2s ease-in-out infinite}
.qlnp-text b{color:#6ee7b7;font-weight:900}
.qlnp-text i{font-style:normal;opacity:.6;margin:0 1px}
.qlnp::after{content:"";position:absolute;top:0;bottom:0;left:0;width:40%;z-index:-1;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);
  transform:translateX(-140%) skewX(-18deg);animation:qlnp-shine 4.5s ease-in-out 1.2s infinite}
@keyframes qlnp-shine{0%{transform:translateX(-140%) skewX(-18deg)}35%,100%{transform:translateX(380%) skewX(-18deg)}}
@keyframes qlnp-bob{0%,100%{transform:translateY(0) rotate(0)}30%{transform:translateY(-1.5px) rotate(-8deg)}60%{transform:translateY(0) rotate(6deg)}}
@media (prefers-reduced-motion:reduce){.qlnp-logo,.qlnp::after{animation:none}.qlnp{transition:none}}
`;

/** Oval "Quiz-LAB" pill for the navbar. Opens the Quiz Lab site in the same tab. */
export default function QuizLabNavPill({ onClick, className = '' }: { onClick?: () => void; className?: string }) {
  return (
    <>
      <style>{CSS}</style>
      <a href={QUIZ_URL} onClick={onClick} className={`qlnp ${className}`} aria-label="Quiz Lab (opens quiz.genziitian.in)">
        <img className="qlnp-logo" src="/quiz-lab-logo.webp" alt="" width={26} height={26} />
        <span className="qlnp-text">Quiz<i>-</i><b>LAB</b></span>
      </a>
    </>
  );
}
