import { ChevronRight, Search, Building2, Rocket, Target, RefreshCw, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const quiz2Courses = [
  {
    id: 'reattempt',
    icon: RefreshCw,
    iconBg: 'bg-red-100',
    title: 'Qualifier Reattempt Batch',
    description: 'For qualifier students: live + recordings batch. Best for fast-track reattempt prep.',
    tags: ['CT', 'Stats 1', 'Maths 1', 'Eng 1'],
    price: '₹699',
    oldPrice: '₹999',
    paymentLink: 'https://rzp.io/rzp/NS9wNPP',
    cta: 'Pay Now',
    rating: '4.9',
    shadow: 'shadow-[8px_8px_0px_#ef4444]',
    hoverShadow: 'hover:shadow-[12px_12px_0px_#ef4444]',
  },
  {
    id: 'foundation-1',
    icon: Building2,
    iconBg: 'bg-blue-100',
    title: 'Term 1 Quiz 2',
    description: 'IIT Madras BS Term 1 Quiz 2 for Maths 1, Stats 1 and Computational Thinking.',
    tags: ['Maths 1', 'Stats 1', 'CT'],
    price: '₹799',
    oldPrice: '₹849',
    paymentLink: 'https://rzp.io/rzp/fAjfTS7',
    cta: 'Pay Now',
    rating: '4.8',
    shadow: 'shadow-[8px_8px_0px_#0b1120]',
    hoverShadow: 'hover:shadow-[12px_12px_0px_#0b1120]',
  },
  {
    id: 'foundation-2',
    icon: Rocket,
    iconBg: 'bg-amber-100',
    title: 'Term 2 Quiz 2',
    description: 'IIT Madras BS Term 2 Quiz 2 for Maths 2, Stats 2 and Python.',
    tags: ['Maths 2', 'Stats 2', 'Python'],
    price: '₹799',
    oldPrice: '₹849',
    paymentLink: 'https://rzp.io/rzp/LOyb6RP',
    cta: 'Pay Now',
    rating: '4.9',
    shadow: 'shadow-[8px_8px_0px_#0b1120]',
    hoverShadow: 'hover:shadow-[12px_12px_0px_#0b1120]',
  },
  {
    id: 'diploma',
    icon: Target,
    iconBg: 'bg-green-100',
    title: 'Diploma Quiz 2',
    description: 'Launch by 20 March. Join waiting list for Java, PDSA, DBMS and MLF.',
    tags: ['Java', 'PDSA', 'DBMS', 'MLF'],
    price: 'Waitlist Open',
    oldPrice: '',
    paymentLink: '/courses/diploma',
    cta: 'Join Waiting List',
    rating: '5.0',
    shadow: 'shadow-[8px_8px_0px_#0b1120]',
    hoverShadow: 'hover:shadow-[12px_12px_0px_#0b1120]',
  },
];

export default function Courses() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100">
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative">
          <div className="absolute inset-0 bg-[#10b981] rounded-[2rem] translate-y-3 translate-x-3 border-2 border-[#0b1120]"></div>
          <div className="relative bg-[#0b1120] text-white rounded-[2rem] p-8 lg:p-16 border-[3px] border-[#0b1120] overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src="https://picsum.photos/seed/learningpath/1200/600" alt="Learning Path" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-[#0b1120]/70"></div>
            </div>

            <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
              <h2 className="text-4xl lg:text-6xl font-black leading-tight mb-6">
                Quiz 2 <span className="relative inline-block">Batches<div className="absolute -bottom-2 left-0 w-full h-2 bg-[#10b981] transform -skew-x-12"></div></span>
              </h2>

              <p className="text-gray-300 font-bold text-lg md:text-xl mb-12 max-w-3xl leading-relaxed">
                Past batches are now hidden. Explore the latest reattempt and Quiz 2 courses with updated plans, pricing and payment links.
              </p>

              <div className="w-full max-w-2xl relative">
                <div className="absolute inset-0 bg-[#10b981] rounded-xl translate-y-1.5 translate-x-1.5 border-2 border-[#0b1120]"></div>
                <div className="relative bg-white border-[3px] border-[#0b1120] rounded-xl flex items-center p-2">
                  <Search className="w-6 h-6 text-gray-400 ml-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search for Quiz 2 batches..."
                    className="w-full px-4 py-3 text-[#0b1120] font-bold placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-black text-[#0b1120] mb-6">Quiz 2 Batch</h1>
          <p className="text-xl text-gray-600 font-medium max-w-3xl mx-auto">
            Enroll in the latest batches: Term 1 Quiz 2, Term 2 Quiz 2, Qualifier Reattempt, and Diploma Quiz 2 waiting list.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {quiz2Courses.map((course) => {
            const Icon = course.icon;
            return (
              <div key={course.id} className={`bg-white border-[3px] border-[#0b1120] rounded-[2rem] p-8 ${course.shadow} ${course.hoverShadow} hover:-translate-y-1 hover:-translate-x-1 transition-all flex flex-col`}>
                <div className={`w-12 h-12 rounded-xl ${course.iconBg} border-2 border-[#0b1120] flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-[#0b1120]" />
                </div>

                <h3 className="text-2xl font-black text-[#0b1120] mb-2">{course.title}</h3>
                <p className="text-gray-600 font-bold text-sm mb-5">{course.description}</p>

                <div className="flex flex-wrap gap-2 mb-6 flex-grow content-start">
                  {course.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs font-bold text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-6 border-t-2 border-gray-100 mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      <span className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}</span>
                      <span className="text-gray-600 ml-1">({course.rating})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">starts from</div>
                      <div className="text-xl font-black text-[#0b1120]">{course.price}</div>
                      {course.oldPrice ? <div className="text-xs text-gray-400 font-bold line-through">{course.oldPrice}</div> : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link to={`/courses/${course.id}`} className="w-full py-3 bg-white text-[#0b1120] rounded-xl font-bold border-2 border-[#0b1120] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      View Details <ChevronRight className="w-4 h-4" />
                    </Link>
                    <a href={course.paymentLink} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#0b1120] text-white rounded-xl font-bold border-2 border-[#0b1120] hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                      {course.cta}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
