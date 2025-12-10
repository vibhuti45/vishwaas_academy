import Navbar from "@/components/Navbar";
import Link from "next/link";

// --- DUMMY COURSE DATA ---
const courses = [
  {
    title: "Class 9 Foundation",
    price: "₹14,999",
    originalPrice: "₹20,000",
    duration: "120+ Hours",
    lectures: "80 Lectures",
    level: "Beginner to Intermediate",
    tags: ["Math", "Science", "English"],
    features: [
      "Weekly Chapter-wise Tests",
      "Live Doubt Clearing",
      "Printed Study Material",
      "Access to Recorded Lectures"
    ],
    color: "bg-blue-50 border-blue-200 text-blue-700"
  },
  {
    title: "Class 10 Board Booster",
    price: "₹19,999",
    originalPrice: "₹25,000",
    duration: "150+ Hours",
    lectures: "100 Lectures",
    level: "Board Exam Focus",
    tags: ["Math", "Science", "SST", "English"],
    features: [
      "Previous Year Questions (PYQs)",
      "Strict Board Pattern Tests",
      "3-Hour Marathon Classes",
      "Personal Mentorship"
    ],
    color: "bg-purple-50 border-purple-200 text-purple-700"
  },
  {
    title: "Olympiad Special (IMO/NSO)",
    price: "₹9,999",
    originalPrice: "₹12,000",
    duration: "60+ Hours",
    lectures: "40 Lectures",
    level: "Advanced",
    tags: ["Math", "Logical Reasoning"],
    features: [
      "High Order Thinking Skills (HOTS)",
      "International Level Problems",
      "Speed Calculation Tricks",
      "Rank Improvement Strategy"
    ],
    color: "bg-orange-50 border-orange-200 text-orange-700"
  },
  {
    title: "Exam Crash Course",
    price: "₹4,999",
    originalPrice: "₹8,000",
    duration: "40 Hours",
    lectures: "25 Lectures",
    level: "Fast Track",
    tags: ["Physics", "Chem", "Math"],
    features: [
      "Quick Concept Revision",
      "Formula Sheets & Cheatsheets",
      "Most Expected Questions",
      "Daily Practice Papers (DPP)"
    ],
    color: "bg-green-50 border-green-200 text-green-700"
  }
];

export default function Courses() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      
      <Navbar />

      {/* --- HERO SECTION --- */}
      <main className="flex-grow bg-slate-50">
        <section className="py-20 text-center px-4">
            <h1 className="text-4xl font-bold text-slate-900 mb-6">Our Learning Paths</h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600">
                Structured courses designed to help you excel in school exams and competitive challenges.
                Choose the plan that fits your goals.
            </p>
        </section>

        {/* --- COURSES GRID --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                {courses.map((course, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-slate-100 overflow-hidden flex flex-col">
                        
                        {/* Header of Card */}
                        <div className={`p-6 border-b ${course.color} bg-opacity-40`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-white ${course.color.split(" ")[2]}`}>
                                        {course.level}
                                    </span>
                                    <h3 className="text-2xl font-bold text-slate-900 mt-3">{course.title}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-slate-900">{course.price}</p>
                                    <p className="text-sm text-slate-500 line-through">{course.originalPrice}</p>
                                </div>
                            </div>
                            
                            {/* Tags */}
                            <div className="flex gap-2 mt-4 flex-wrap">
                                {course.tags.map(tag => (
                                    <span key={tag} className="text-xs font-semibold bg-white/60 px-2 py-1 rounded text-slate-700">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Body of Card */}
                        <div className="p-8 flex-grow flex flex-col">
                            {/* Stats */}
                            <div className="flex gap-6 text-sm font-medium text-slate-500 mb-6 border-b border-slate-100 pb-6">
                                <div className="flex items-center gap-2">
                                    <span>⏳</span> {course.duration}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>📺</span> {course.lectures}
                                </div>
                            </div>

                            {/* Features List */}
                            <ul className="space-y-3 mb-8 flex-grow">
                                {course.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700">
                                        <span className="text-green-500 font-bold">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* Action Button */}
                            <button className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 hover:shadow-lg transition">
                                View Details & Enroll
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Vishwaas Academy. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}