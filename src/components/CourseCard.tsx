import { GraduationCap, RefreshCcw, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export type CourseCardData = {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  price: number;
  discountPrice?: number | null;
  isPinned?: boolean;
  isBundle?: boolean;
  bundleCourses?: { courseId: string; courseName: string }[];
};

type CourseCardProps = {
  course: CourseCardData;
  className?: string;
};

export default function CourseCard({ course, className = '' }: CourseCardProps) {
  const navigate = useNavigate();

  const displayPrice = course.discountPrice || course.price;

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className={`group relative bg-white border-[4px] border-[#0b1120] rounded-[32px] overflow-hidden hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_#ef4444] transition-all flex flex-col cursor-pointer ${
        course.isPinned ? 'ring-4 ring-blue-500/20' : ''
      } ${className}`}
    >
      <div className="p-6 md:p-8 flex-grow flex flex-col relative bg-white h-full">
        <div className="w-14 h-14 bg-pink-100 border-[3px] border-[#0b1120] rounded-2xl flex items-center justify-center mb-6">
          {course.isBundle ? (
            <RefreshCcw className="w-6 h-6 text-[#0b1120]" />
          ) : (
            <GraduationCap className="w-6 h-6 text-[#0b1120]" />
          )}
        </div>

        <h3 className="text-2xl font-black text-[#0b1120] mb-3 leading-tight group-hover:text-blue-600 transition-colors">
          {course.name}
        </h3>

        <p className="text-gray-600 font-bold text-sm mb-6 flex-grow">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {course.isBundle && course.bundleCourses?.map((bundleCourse, idx) => (
            <span
              key={`${bundleCourse.courseId}-${idx}`}
              className="px-3 py-1 bg-gray-50 border-2 border-gray-200 rounded-xl text-xs font-black text-gray-700"
            >
              {bundleCourse.courseName}
            </span>
          ))}
          {!course.isBundle && course.subject && (
            <span className="px-3 py-1 bg-gray-50 border-2 border-gray-200 rounded-xl text-xs font-black text-gray-700">
              {course.subject}
            </span>
          )}
        </div>

        <div className="h-0.5 w-full bg-gray-100 mb-6"></div>

        <div className="mt-auto">
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-gray-500 font-bold text-sm ml-1">(4.9)</span>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Starts From</div>
              <div className="flex flex-col items-end leading-none">
                <span className="text-2xl font-black text-[#0b1120]">₹{displayPrice}</span>
                {course.discountPrice && (
                  <span className="text-xs font-black text-gray-400 line-through mt-1">₹{course.price}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to={`/courses/${course.id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full py-3.5 bg-white text-[#0b1120] rounded-xl font-black text-center text-sm lg:text-base border-[3px] border-[#0b1120] hover:bg-gray-50 transition-all active:translate-y-1"
            >
              View Details {'>'}
            </Link>
            <Link
              to={`/checkout/${course.id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full py-3.5 bg-[#1e293b] text-white rounded-xl border-[3px] border-[#1e293b] hover:bg-black transition-all font-black text-sm lg:text-base active:translate-y-1 flex items-center justify-center"
            >
              Enroll Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
