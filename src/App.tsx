import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { saveReferralCookie } from './lib/referral';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/mobile/MobileNav';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Syllabus from './pages/Syllabus';
import Resources from './pages/Resources';
import ResourceDetail from './pages/ResourceDetail';
import Contact from './pages/Contact';
import About from './pages/About';
import Careers from './pages/Careers';
import Verify from './pages/Verify';
import Newsletter from './pages/Newsletter';
import SEODirectory from './pages/SEODirectory';
import SEOPage from './pages/SEOPage';
import Docs from './pages/Docs';
import DocsDetail from './pages/DocsDetail';
import GradedAssignment from './pages/GradedAssignment';
import ToolsPage from './pages/tools/ToolsPage';
import AccessPdf from './pages/AccessPdf';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Referral from './pages/Referral';
import CourseSelection from './pages/CourseSelection';
import Manager from './pages/Manager';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import EmployeePolicy from './pages/EmployeePolicy';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import Menu from './pages/Menu';
import Ecosystem from './pages/Ecosystem';
import OneOnOne from './pages/OneOnOne';
import {
  Unauthorized,
  Forbidden,
  NotFound,
  ServerError,
  ServiceUnavailable,
} from './pages/errors';
import LoginModal from './components/LoginModal';
import WelcomeModal from './components/WelcomeModal';
import DocumentNavigation from './public/DocumentNavigation';
import ApplicationMetadata from './public/ApplicationMetadata';
import SaleTicker from './components/SaleTicker';

// Captures ?ref=CODE from the URL and saves it to localStorage with 24h expiry
function ReferralCapture() {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      saveReferralCookie(refCode);
    }
  }, [searchParams]);
  return null;
}

// Scrolls to top on every route change so new pages always start from the header
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isCheckoutPage = location.pathname.startsWith('/checkout/');
  const isCoursesPage = location.pathname === '/courses';
  const isManagerPage = location.pathname.startsWith('/manager');
  const isOneOnOnePage = location.pathname === '/one-to-one' || location.pathname === '/1-on-1';

  return (
    <div className="min-h-screen bg-white text-[#0b1120] font-sans selection:bg-blue-100 flex flex-col">
      <ScrollToTop />
      {!isManagerPage && <Navbar />}
      {location.pathname === '/' && <SaleTicker />}
      {/* pb on mobile clears the fixed bottom tab bar; removed on checkout + manager */}
      <main className={`flex-grow ${isCheckoutPage || isManagerPage ? '' : 'pb-24 md:pb-0'}`}>
        <ApplicationMetadata />
        <Routes>
          <Route path="/" element={<DocumentNavigation />} />
          <Route path="/one-to-one" element={<OneOnOne />} />
          <Route path="/1-on-1" element={<OneOnOne />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/ecosystem" element={<Ecosystem />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/resources" element={<DocumentNavigation />} />
          <Route path="/resources/:level/:subject" element={<DocumentNavigation />} />
          <Route path="/iitm-bs/*" element={<DocumentNavigation />} />
          <Route path="/graded-assignment" element={<DocumentNavigation />} />
          <Route path="/tools/cgpa-calculator" element={<ToolsPage />} />
          <Route path="/tools/grade-predictor" element={<ToolsPage />} />
          <Route path="/tools/grading-scale" element={<ToolsPage />} />
          <Route path="/access-pdf" element={<AccessPdf />} />
          <Route path="/blog" element={<DocumentNavigation />} />
          <Route path="/blog/:slug" element={<DocumentNavigation />} />
          <Route path="/docs" element={<DocumentNavigation />} />
          <Route path="/docs/:slug" element={<DocumentNavigation />} />
          <Route path="/about" element={<DocumentNavigation />} />
          <Route path="/contact" element={<DocumentNavigation />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/knowledge" element={<DocumentNavigation />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout/:id" element={<CourseSelection />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/refer" element={<Referral />} />
          <Route path="/manager/*" element={<Manager />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/employee/policy" element={<EmployeePolicy />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          {/* Error pages */}
          <Route path="/401" element={<Unauthorized />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/503" element={<ServiceUnavailable />} />
          <Route path="/error/401" element={<Unauthorized />} />
          <Route path="/error/403" element={<Forbidden />} />
          <Route path="/error/404" element={<NotFound />} />
          <Route path="/error/500" element={<ServerError />} />
          <Route path="/error/503" element={<ServiceUnavailable />} />
          {/* pSEO catch-all — must be last */}
          <Route path="/*" element={<DocumentNavigation />} />
        </Routes>
      </main>
      {/* Footer is hidden on mobile — the bottom-nav Menu tab covers all links there */}
      {!isCheckoutPage && !isCoursesPage && !isManagerPage && !isOneOnOnePage && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
      {!isCheckoutPage && !isManagerPage && <MobileNav />}
    </div>
  );
}

export default function App() {

  return (
    <AuthProvider>
      <CartProvider>
        <LoginModal />
        <WelcomeModal />
        <Router>
          <ReferralCapture />
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

