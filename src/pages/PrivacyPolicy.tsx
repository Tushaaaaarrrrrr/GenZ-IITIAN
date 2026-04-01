import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0b1120] font-sans selection:bg-blue-100">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-16">
          <h1 className="text-4xl lg:text-5xl font-black text-[#0b1120] mb-4">Privacy Policy</h1>
          <p className="text-gray-500 font-bold">Last Updated: April 2026</p>
          <div className="h-1.5 w-24 bg-[#10b981] mt-6 rounded-full"></div>
        </div>

        <div className="space-y-12 text-lg text-gray-600 font-medium leading-relaxed">
          <p className="text-xl text-[#0b1120] font-bold">
            At Gen-Z IITian, we are committed to protecting your personal information and your right to privacy. This Privacy Policy outlines how we collect, use, and protect your data.
          </p>

          <section>
            <h2 className="text-2xl font-black text-[#0b1120] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#eef2ff] text-[#0b1120] text-sm">01</span>
              Data We Collect
            </h2>
            <p>
              When you sign up for Gen-Z IITian using Google Login, we collect certain personal information provided by Google, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Full Name</li>
              <li>Email address</li>
              <li>Profile Picture (optional)</li>
            </ul>
            <p className="mt-4">
              We may also collect additional information if you choose to provide it in your profile or during checkout, such as your phone number.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-[#0b1120] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#eef2ff] text-[#0b1120] text-sm">02</span>
              How We Use Your Data
            </h2>
            <p>
              Your data is used solely for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Creating and managing your user account</li>
              <li>Providing instant access to purchased courses</li>
              <li>Processing payments through secure gateways</li>
              <li>Sending important course updates and enrollment notifications</li>
              <li>Improving our services based on user feedback and engagement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-[#0b1120] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#eef2ff] text-[#0b1120] text-sm">03</span>
              Data Sharing & Disclosure
            </h2>
            <p>
              Your personal information is shared only with trusted third parties to facilitate our services:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Payment Gateways:</strong> To securely process your transactions (Razorpay, Stripe, or Cashfree).</li>
              <li><strong>LMS Providers:</strong> To provide access to course content and track progress.</li>
            </ul>
            <p className="mt-4 font-bold text-[#0b1120]">
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-[#0b1120] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#eef2ff] text-[#0b1120] text-sm">04</span>
              Data Security & Protection
            </h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. All data is stored in secure databases and accessible only by authorized personnel. Payment details are handled by PCI-compliant payment processors and are not stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-[#0b1120] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#eef2ff] text-[#0b1120] text-sm">05</span>
              Cookies & Tracking
            </h2>
            <p>
              We use essential cookies to maintain your session and ensure you stay logged in while navigating the platform. These cookies do not track your activity on other websites.
            </p>
          </section>

          <div className="p-8 bg-[#f8fafc] border-2 border-dashed border-gray-200 rounded-3xl mt-16 text-center">
            <p className="text-gray-500 font-bold mb-4">Have questions about your privacy?</p>
            <a href="/contact" className="text-[#10b981] font-black hover:underline">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
