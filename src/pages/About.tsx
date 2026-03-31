export default function About() {
  return (
    <div className="min-h-screen bg-white text-[#0b1120] font-sans selection:bg-blue-100">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-black text-[#0b1120] mb-6">About Us</h1>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
            We are on a mission to democratize quality education and empower students to achieve their dreams.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
            <div className="absolute inset-0 bg-[#eef2ff] rounded-[3rem] border-[3px] border-[#0b1120] shadow-[12px_12px_0px_#0b1120] transform -rotate-6"></div>
            <img src="https://picsum.photos/seed/about/600/600" alt="About Us" className="absolute inset-0 w-full h-full object-cover rounded-[3rem] border-[3px] border-[#0b1120]" />
          </div>

          <div>
            <h2 className="text-4xl font-black text-[#0b1120] mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 font-medium mb-6 leading-relaxed">
              Gen-Z IITian was founded with a simple yet powerful vision: to make high-quality, IIT-level education accessible to everyone, regardless of their background or location.
            </p>
            <p className="text-lg text-gray-600 font-medium mb-8 leading-relaxed">
              We recognized the challenges faced by online and hybrid degree students—lack of structured resources, limited mentorship, and isolation. Our platform bridges this gap by providing comprehensive courses, expert guidance, and a thriving community.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-6 shadow-[6px_6px_0px_#10b981]">
                <div className="text-4xl font-black text-[#0b1120] mb-2">10K+</div>
                <div className="font-bold text-gray-600">Students Empowered</div>
              </div>
              <div className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-6 shadow-[6px_6px_0px_#10b981]">
                <div className="text-4xl font-black text-[#0b1120] mb-2">50+</div>
                <div className="font-bold text-gray-600">Expert Instructors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Founder Section */}
        <div className="bg-[#eef2ff] border-[3px] border-[#0b1120] rounded-[3rem] p-8 lg:p-16 mb-24 shadow-[12px_12px_0px_#0b1120]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-block px-4 py-1.5 bg-[#10b981] text-white font-black text-sm rounded-full border-2 border-[#0b1120] mb-6">
                MEET THE FOUNDER
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-[#0b1120] mb-6">
                Sriram
              </h2>
              <p className="text-xl text-[#0b1120] font-bold mb-6 italic">
                "Education is not just about learning facts, but training the mind to think."
              </p>
              <div className="space-y-4 text-gray-600 font-medium text-lg leading-relaxed">
                <p>
                  Sriram is a passionate educator and visionary dedicated to transforming the landscape of online learning. With a deep understanding of the IIT Madras curriculum and the unique challenges of hybrid education, he founded Gen-Z IITian to provide students with the high-quality resources they deserve.
                </p>
                <p>
                  His mission is to create an ecosystem where every student, regardless of their starting point, has the tools and support to excel. Under his leadership, Gen-Z IITian has grown into a community of thousands of dedicated learners.
                </p>
              </div>
              <div className="flex gap-4 mt-8">
                <a href="https://www.linkedin.com/in/hustlewithsriram/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border-2 border-[#0b1120] flex items-center justify-center bg-white hover:bg-gray-50 transition-colors">
                  <span className="text-xl">💼</span>
                </a>
                <a href="https://www.instagram.com/curious_sri/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border-2 border-[#0b1120] flex items-center justify-center bg-white hover:bg-gray-50 transition-colors">
                  <span className="text-xl">📸</span>
                </a>
                <a href="https://www.youtube.com/@SriRam_in" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border-2 border-[#0b1120] flex items-center justify-center bg-white hover:bg-gray-50 transition-colors">
                  <span className="text-xl">📺</span>
                </a>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-sm aspect-[4/5] bg-white rounded-3xl border-[3px] border-[#0b1120] overflow-hidden shadow-[12px_12px_0px_#0b1120]">
                <img src="https://picsum.photos/seed/sriram/600/800" alt="Sriram Founder" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0b1120] text-white rounded-[3rem] border-[3px] border-[#0b1120] p-12 lg:p-20 text-center shadow-[16px_16px_0px_#10b981]">
          <h2 className="text-4xl lg:text-5xl font-black mb-8">Join the Revolution</h2>
          <p className="text-xl text-gray-300 font-medium max-w-3xl mx-auto mb-10">
            Whether you're looking to master a new skill, prepare for an exam, or advance your career, we have the resources and community to support you every step of the way.
          </p>
          <button className="px-8 py-4 bg-[#10b981] text-white rounded-xl font-black text-xl border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#0b1120] transition-all">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
}
