import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { saveReferralCookie } from './lib/referral';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import Newsletter from './pages/Newsletter';
import SEODirectory from './pages/SEODirectory';
import SEOPage from './pages/SEOPage';
import Docs from './pages/Docs';
import DocsDetail from './pages/DocsDetail';
import GradedAssignment from './pages/GradedAssignment';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Referral from './pages/Referral';
import CourseSelection from './pages/CourseSelection';
import Manager from './pages/Manager';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import LoginModal from './components/LoginModal';

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

  return (
    <div className="min-h-screen bg-white text-[#0b1120] font-sans selection:bg-blue-100 flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:level/:subject" element={<ResourceDetail />} />
          <Route path="/graded-assignment" element={<GradedAssignment />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/docs/:slug" element={<DocsDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/knowledge" element={<SEODirectory />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout/:id" element={<CourseSelection />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/refer" element={<Referral />} />
          <Route path="/manager/*" element={<Manager />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          {/* pSEO catch-all — must be last */}
          <Route path="/*" element={<SEOPage />} />
        </Routes>
      </main>
      {!isCheckoutPage && <Footer />}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Fetch Global Settings for SEO
    fetch('/api/settings')
      .then(res => res.json())
      .then(config => {
        if (config.site_title) document.title = config.site_title;
        if (config.site_description) {
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', config.site_description);
        }
      })
      .catch(() => { });
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <LoginModal />
        <Router>
          <ReferralCapture />
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

