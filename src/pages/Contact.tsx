import { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#0b1120] font-sans selection:bg-blue-100">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-black text-[#0b1120] mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="bg-[#eef2ff] border-[3px] border-[#0b1120] rounded-[2.5rem] p-8 lg:p-12 shadow-[12px_12px_0px_#0b1120]">
            <h2 className="text-3xl font-black text-[#0b1120] mb-8">Send a Message</h2>
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-black text-[#0b1120] mb-2">Message Sent!</h3>
                <p className="text-gray-600 font-bold mb-6">We'll get back to you soon.</p>
                <button onClick={() => setSubmitted(false)} className="px-6 py-3 bg-[#10b981] text-white rounded-xl font-bold border-2 border-[#0b1120]">
                  Send Another
                </button>
              </div>
            ) : (
              <form
                className="flex flex-col gap-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const params = new URLSearchParams(window.location.search);

                  const payload = new URLSearchParams();
                  payload.append('form_type', 'Contact Us');
                  payload.append('name', formData.get('entry.1234567890') as string);
                  payload.append('email', formData.get('entry.0987654321') as string);
                  payload.append('message', formData.get('entry.5566778899') as string);
                  payload.append('utm_source', params.get('utm_source') || 'direct');
                  payload.append('utm_medium', params.get('utm_medium') || 'organic');
                  payload.append('utm_campaign', params.get('utm_campaign') || 'none');

                  try {
                    // Replace YOUR_SCRIPT_URL with your Google Apps Script Web App URL
                    await fetch('https://script.google.com/macros/s/AKfycbysGFbxo9r41D5kMnKmO90rr9u_mzn5aBuhZG6AFvRZOhDtFJ9dclTHgJJqdcBNS-Ny/exec', {
                      method: 'POST',
                      mode: 'no-cors',
                      body: payload
                    });
                  } catch (e) {
                    console.error('Submission error:', e);
                  }
                  setSubmitting(false);
                  setSubmitted(true);
                  form.reset();
                }}
              >
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-[#0b1120]">Full Name</label>
                  <input
                    name="entry.1234567890"
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-6 py-4 rounded-xl bg-white border-[3px] border-[#0b1120] text-[#0b1120] placeholder-gray-400 focus:outline-none focus:border-[#10b981] transition-colors font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-[#0b1120]">Email Address</label>
                  <input
                    name="entry.0987654321"
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-6 py-4 rounded-xl bg-white border-[3px] border-[#0b1120] text-[#0b1120] placeholder-gray-400 focus:outline-none focus:border-[#10b981] transition-colors font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-[#0b1120]">Message</label>
                  <textarea
                    name="entry.5566778899"
                    placeholder="How can we help you?"
                    rows={5}
                    className="w-full px-6 py-4 rounded-xl bg-white border-[3px] border-[#0b1120] text-[#0b1120] placeholder-gray-400 focus:outline-none focus:border-[#10b981] transition-colors font-medium resize-none"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-[#10b981] text-white rounded-xl font-black text-xl border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#0b1120] transition-all mt-4 disabled:opacity-60"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-8">
            <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#0b1120]">
              <div className="w-16 h-16 rounded-full bg-blue-100 border-[3px] border-[#0b1120] flex items-center justify-center text-3xl mb-6">
                📧
              </div>
              <h3 className="text-2xl font-black text-[#0b1120] mb-2">Email Us</h3>
              <p className="text-gray-600 font-bold mb-4">Our friendly team is here to help.</p>
              <a href="mailto:help@genziitian.in" className="text-[#10b981] font-black text-lg hover:underline">help@genziitian.in</a>
            </div>

            <a href="https://chat.whatsapp.com/Gi4D9yAd99p7q1XeVh0J1e" target="_blank" rel="noopener noreferrer" className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_#0b1120] transition-all group">
              <div className="w-16 h-16 rounded-full bg-green-100 border-[3px] border-[#0b1120] flex items-center justify-center text-3xl mb-6">
                💬
              </div>
              <h3 className="text-2xl font-black text-[#0b1120] mb-2 group-hover:text-green-600 transition-colors">Join WhatsApp Community</h3>
              <p className="text-gray-600 font-bold mb-4">Chat with our community and support team.</p>
              <span className="text-[#10b981] font-black text-lg">Join Now →</span>
            </a>

            <a href="https://www.linkedin.com/company/102554405/" target="_blank" rel="noopener noreferrer" className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_#0b1120] transition-all group">
              <div className="w-16 h-16 rounded-full bg-blue-100 border-[3px] border-[#0b1120] flex items-center justify-center text-3xl mb-6">
                💼
              </div>
              <h3 className="text-2xl font-black text-[#0b1120] mb-2 group-hover:text-blue-600 transition-colors">LinkedIn Page</h3>
              <p className="text-gray-600 font-bold mb-4">Follow us for professional updates and news.</p>
              <span className="text-[#10b981] font-black text-lg">Follow Us →</span>
            </a>

            <a href="https://www.instagram.com/genz_iitian/" target="_blank" rel="noopener noreferrer" className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_#0b1120] transition-all group">
              <div className="w-16 h-16 rounded-full bg-pink-100 border-[3px] border-[#0b1120] flex items-center justify-center text-3xl mb-6">
                📸
              </div>
              <h3 className="text-2xl font-black text-[#0b1120] mb-2 group-hover:text-pink-600 transition-colors">Instagram</h3>
              <p className="text-gray-600 font-bold mb-4">Check our latest reels and student life updates.</p>
              <span className="text-[#10b981] font-black text-lg">Follow Us →</span>
            </a>

            <a href="https://youtube.com/@Gen-ZIITian/" target="_blank" rel="noopener noreferrer" className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_#0b1120] transition-all group">
              <div className="w-16 h-16 rounded-full bg-red-100 border-[3px] border-[#0b1120] flex items-center justify-center text-3xl mb-6">
                ▶️
              </div>
              <h3 className="text-2xl font-black text-[#0b1120] mb-2 group-hover:text-red-600 transition-colors">YouTube Channel</h3>
              <p className="text-gray-600 font-bold mb-4">Watch free lectures and tutorials.</p>
              <span className="text-[#10b981] font-black text-lg">Subscribe →</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
