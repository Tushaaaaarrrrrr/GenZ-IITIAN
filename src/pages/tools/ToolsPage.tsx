import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Tabs, { TabDef } from '../../components/tools/Tabs';
import LedgerPanel from '../../components/tools/Ledger/LedgerPanel';
import PredictorPanel from '../../components/tools/Predictor/PredictorPanel';
import GradingScale from '../../components/tools/GradingScale';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ledger.css';

type TabKey = 'ledger' | 'predictor' | 'scale';

const ROUTE_FOR_TAB: Record<TabKey, string> = {
  ledger: '/tools/cgpa-calculator',
  predictor: '/tools/grade-predictor',
  scale: '/tools/grading-scale',
};

const TABS: TabDef<TabKey>[] = [
  { key: 'ledger', label: 'CGPA / SGPA Ledger' },
  { key: 'predictor', label: 'Grade Predictor' },
  { key: 'scale', label: 'Grading Scale' },
];

function tabForPath(pathname: string): TabKey {
  if (pathname.startsWith('/tools/grade-predictor')) return 'predictor';
  if (pathname.startsWith('/tools/grading-scale')) return 'scale';
  return 'ledger';
}

export default function ToolsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openLoginModal } = useAuth();
  const activeTab = tabForPath(location.pathname);

  return (
    <div className="gz-tools">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <header className="mb-8">
          <p className="gz-mono text-xs uppercase tracking-[0.2em] text-[var(--gz-ink-soft)] mb-2">
            IIT Madras BS Degree
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold" style={{ fontFamily: "'Source Serif 4', serif" }}>
            CGPA Ledger &amp; Grade Predictor
          </h1>
          <p className="text-[var(--gz-ink-soft)] mt-2 max-w-xl">
            Track your marksheet, predict a course grade before the Final, and check the official cutoffs — all
            computed locally in your browser.
          </p>
        </header>

        <Tabs tabs={TABS} active={activeTab} onChange={(key) => navigate(ROUTE_FOR_TAB[key])} />

        {activeTab === 'ledger' &&
          (user ? (
            <LedgerPanel />
          ) : (
            <div className="gz-locked p-8 text-center max-w-md mx-auto">
              <p className="mb-4 text-[var(--gz-ink-soft)]">
                Sign in to save your CGPA ledger — your grades are stored only in your own browser, never on our
                servers.
              </p>
              <button type="button" onClick={openLoginModal} className="gz-btn gz-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
                <LogIn className="w-4 h-4" /> Sign in to continue
              </button>
            </div>
          ))}

        {activeTab === 'predictor' && <PredictorPanel />}
        {activeTab === 'scale' && <GradingScale />}
      </div>
    </div>
  );
}
