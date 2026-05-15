import { useState } from 'react';
import { ChevronDown, ChevronUp, Briefcase, Star, Users, BrainCircuit, Rocket, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HiringSection() {
  const [openJob, setOpenJob] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Vaibhav",
      role: "Maths 1 Tutor",
      content: "Working here helped me master my own college subjects! Teaching others the same syllabus I studied gave me a unique edge in my career interviews."
    },
    {
      id: 2,
      name: "Ayush",
      role: "Computational Thinking Tutor",
      content: "The flexible hours allowed me to balance my own studies while earning a good stipend. The students are eager to learn, making the process very rewarding."
    },
    {
      id: 3,
      name: "Ankit K.",
      role: "Machine Learning Tutor",
      content: "It's an amazing platform for peer-to-peer learning. Preparing course material strengthened my ML foundations more than any regular coursework could."
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isIITM: 'Yes',
    level: 'Foundation',
    subject: '',
    language: 'English',
    cgpa: '',
    resumeLink: '',
  });

  const subjects = {
    Foundation: [
      'Mathematics for Data Science I',
      'Mathematics for Data Science II',
      'Statistics for Data Science I',
      'Statistics for Data Science II',
      'Computational Thinking',
      'Programming in Python'
    ],
    Diploma: [
      'PDSA (using Python)',
      'Programming Concepts using Java',
      'Database Management Systems',
      'Machine Learning Foundations',
      'Machine Learning Techniques',
      'Machine Learning Practice',
      'Modern Application Development 1 (MAD 1)',
      'Modern Application Development 2 (MAD 2)',
      'Deep Learning & Gen AI'
    ]
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get the Web App URL from environment variables
      const GOOGLE_SCRIPT_URL = import.meta.env.VITE_CAREERS_SCRIPT_URL;
      
      if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Mock delay if URL is not set
        await new Promise(r => setTimeout(r, 1500));
      }
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting application', error);
      alert('Something went wrong. Please try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="careers" className="py-24 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Job Openings */}
        <div className="max-w-4xl mx-auto mb-24">
          <h3 className="text-3xl font-black text-[#0b1120] mb-8 flex items-center gap-3">
            <BrainCircuit className="text-blue-600" /> Current Openings
          </h3>

          {/* Accordion Item: Subject Tutor */}
          <div className="bg-white rounded-2xl border-2 border-[#0b1120] shadow-[8px_8px_0px_#0b1120] overflow-hidden transition-all">
            <button 
              onClick={() => {
                const isOpening = openJob !== 'tutor';
                setOpenJob(isOpening ? 'tutor' : null);
                if (!isOpening) setShowForm(false);
              }}
              className="w-full px-8 py-6 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div>
                <h4 className="text-xl md:text-2xl font-black text-[#0b1120] mb-2">Subject Tutor (Faculty)</h4>
                <div className="flex gap-3 text-sm font-bold">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg">Part-time / Paid</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">Remote</span>
                </div>
              </div>
              {openJob === 'tutor' ? <ChevronUp className="w-8 h-8" /> : <ChevronDown className="w-8 h-8" />}
            </button>

            {openJob === 'tutor' && (
              <div className="px-8 py-6 border-t-2 border-gray-100 bg-gray-50/50">
                <div className="mb-10 text-gray-700 prose prose-blue max-w-none">
                  <p className="font-medium text-lg mb-6 text-[#0b1120]">
                    Are you passionate about educating peers and simplifying tough subjects? We are looking for dedicated Subject Tutors to guide students towards academic excellence. Share your knowledge, earn while you learn, and build a stellar profile!
                  </p>
                  
                  <h5 className="font-bold text-[#0b1120] text-lg mt-6 mb-3">Roles & Responsibilities:</h5>
                  <ul className="list-disc pl-5 space-y-2 font-medium">
                    <li>Deliver high-quality lessons in <strong>Hindi, English, or comfortably blended (Both)</strong>.</li>
                    <li>Teach foundational or diploma-level subjects aligned with the curriculum.</li>
                    <li>Solve student doubts and create engaging academic content.</li>
                  </ul>

                  <h5 className="font-bold text-[#0b1120] text-lg mt-6 mb-3">What We Need From You:</h5>
                  <ul className="list-disc pl-5 space-y-2 font-medium">
                    <li><strong>Tech-Ready:</strong> A digital pen tablet/graphic pad, a laptop, good microphone, and stable internet are mandatory.</li>
                    <li><strong>Academic Excellence:</strong> CGPA of 7.5+ in the subject you wish to teach is highly preferred.</li>
                    <li><strong>Background:</strong> Being an IIT Madras BS student is a bonus (but completely optional).</li>
                    <li>Unwavering passion for teaching!</li>
                  </ul>

                  <h5 className="font-bold text-[#0b1120] text-lg mt-6 mb-3">Perks & Compensation:</h5>
                  <ul className="space-y-2 font-medium">
                    <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> <strong>Stipend:</strong> ₹5,000 to ₹10,000 per month (based on interview & merit).</li>
                    <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> <strong>Experience:</strong> Add a highly valued teaching internship to your CV.</li>
                    <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> <strong>Visibility:</strong> Open doors to immense future career prospects!</li>
                  </ul>
                  
                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube" className="w-[40px] h-[30px] object-contain" />
                    <p className="font-bold text-[#0b1120] m-0">
                      Check out our teaching style: <br/>
                      <a href="https://www.youtube.com/@Gen-ZIITian/videos" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">youtube.com/@Gen-ZIITian/videos</a>
                    </p>
                  </div>

                  {!showForm && (
                    <div className="mt-8 flex justify-center">
                      <button 
                        onClick={() => setShowForm(true)}
                        className="px-8 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors border-2 border-transparent shadow-[4px_4px_0px_#0b1120] text-lg"
                      >
                        Apply for this role
                      </button>
                    </div>
                  )}
                </div>

                {/* Application Form */}
                {showForm && (
                <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-200 mt-6 inline-block w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-2xl font-black text-[#0b1120]">Apply Now!</h4>
                    <button onClick={() => setShowForm(false)} className="text-sm font-bold text-gray-500 hover:text-gray-800">Close Form</button>
                  </div>
                  
                  {submitted ? (
                    <div className="text-center py-10 bg-green-50 rounded-xl border-2 border-green-200">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-2xl font-bold text-green-800 mb-2">Thank you!</h4>
                      <p className="font-medium text-green-700">Your application has been received. We will contact you soon!</p>
                      <button onClick={() => setSubmitted(false)} className="mt-6 font-bold text-blue-600 hover:text-blue-800">Submit another application</button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                          <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-colors font-medium outline-none" placeholder="John Doe" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                          <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-colors font-medium outline-none" placeholder="john@example.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Phone / WhatsApp *</label>
                          <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-colors font-medium outline-none" placeholder="+91 9876543210" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Are you an IITM BS Student? *</label>
                          <select required name="isIITM" value={formData.isIITM} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-colors font-medium outline-none">
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Teaching Level *</label>
                          <select required name="level" value={formData.level} onChange={(e) => { handleInputChange(e); setFormData(prev => ({...prev, subject: subjects[e.target.value as keyof typeof subjects][0] })) }} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-colors font-medium outline-none">
                            <option value="Foundation">Foundation</option>
                            <option value="Diploma">Diploma</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Target Subject *</label>
                          <select required name="subject" value={formData.subject} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-colors font-medium outline-none">
                            <option value="" disabled>Select a subject...</option>
                            {subjects[formData.level as keyof typeof subjects].map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Teaching Language *</label>
                          <select required name="language" value={formData.language} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-colors font-medium outline-none">
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Both (English + Hindi)">Both (English + Hindi)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Subject CGPA / Grade *</label>
                          <input required type="text" name="cgpa" value={formData.cgpa} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-colors font-medium outline-none" placeholder="e.g. 8.5 or S Grade" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Resume / CV Link *</label>
                        <input required type="url" name="resumeLink" value={formData.resumeLink} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-colors font-medium outline-none" placeholder="Google Drive / Dropbox link (Make sure it's public)" />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#0b1120] text-white font-black rounded-xl hover:bg-gray-800 transition-colors border-2 border-transparent disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                      </button>
                    </form>
                  )}
                </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. Why Work With Us */}
        <div className="max-w-5xl mx-auto mb-24">
          <h3 className="text-3xl font-black text-[#0b1120] mb-8 flex items-center gap-3">
            <Star className="text-yellow-500" /> Why Work With Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0b1120] mb-3">Vibrant Work Culture</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Experience a vibrant work culture where your ideas matter. We offer flexible working hours, creative freedom in teaching, and a peer-driven environment that pushes you to excel.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0b1120] mb-3">The Power of Internships</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Internships bridge the gap between theory and practice. Teaching solidifies your own foundational knowledge while building a strong professional network and adding massive weight to your resume.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Feedback Slider */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-black text-[#0b1120] mb-8 flex items-center gap-3">
            <Users className="text-purple-600" /> What Our Tutors Say
          </h3>
          <div className="relative bg-white rounded-2xl border-2 border-[#0b1120] shadow-[8px_8px_0px_#0b1120] p-8 md:p-12">
            <div className="overflow-hidden">
               <p className="text-lg md:text-xl text-gray-700 font-medium italic mb-6">"{testimonials[currentTestimonial].content}"</p>
               <div>
                 <p className="font-black text-[#0b1120]">{testimonials[currentTestimonial].name}</p>
                 <p className="text-sm font-bold text-gray-500">{testimonials[currentTestimonial].role}</p>
               </div>
            </div>
            
            <div className="flex gap-4 mt-8 justify-end">
               <button onClick={prevTestimonial} className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#0b1120] hover:bg-gray-50 transition-colors">
                 <ChevronLeft className="w-6 h-6 text-[#0b1120]" />
               </button>
               <button onClick={nextTestimonial} className="w-12 h-12 rounded-full border-2 border-[#0b1120] bg-[#0b1120] text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_#0b1120]">
                 <ChevronRight className="w-6 h-6 text-white" />
               </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}