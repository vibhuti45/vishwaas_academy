"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase"; // Import database
import { collection, getDocs } from "firebase/firestore"; // Import fetch tools
import Image from "next/image";
import Link from "next/link";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH REAL DATA FROM FIREBASE ---
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const courseList: any[] = [];
        
        querySnapshot.forEach((doc) => {
          // We combine the ID with the data
          courseList.push({ id: doc.id, ...doc.data() });
        });
        
        setCourses(courseList);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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
            
            {loading ? (
                // Loading State
                <div className="text-center py-20 text-slate-500">Loading available courses...</div>
            ) : courses.length === 0 ? (
                // Empty State
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <h3 className="text-xl font-bold text-slate-400">No courses launched yet.</h3>
                    <p className="text-slate-500 mt-2">Check back soon!</p>
                </div>
            ) : (
                // REAL DATA GRID
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-slate-100 overflow-hidden flex flex-col">
                            
                            {/* Header of Card */}
                            <div className="p-6 border-b bg-blue-50/50 border-blue-100">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-white text-blue-600 border border-blue-100">
                                            {course.grade}
                                        </span>
                                        <h3 className="text-2xl font-bold text-slate-900 mt-3">{course.title}</h3>
                                        {/* Subject Tag */}
                                        <span className="inline-block mt-2 text-xs font-semibold bg-slate-200 px-2 py-1 rounded text-slate-700">
                                            #{course.subject}
                                        </span>
                                    </div>
                                    
                                    {/* Thumbnail (If exists) */}
                                    {course.thumbnail && (
                                        <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                                            <Image 
                                                src={course.thumbnail} 
                                                alt={course.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Body of Card */}
                            <div className="p-8 flex-grow flex flex-col">
                                {/* Description */}
                                <p className="text-slate-600 mb-6 flex-grow">
                                    {course.description || "No description provided."}
                                </p>

                                {/* Placeholder Features (Since we didn't add them to Admin yet) */}
                                <div className="text-sm text-slate-500 mb-6 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span>👨‍🏫</span> 
                                        <span>Expert Faculty Assigned</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>📚</span> 
                                        <span>Full Syllabus Coverage</span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Link href={`/courses/${course.id}`} className="block">
                                    <button className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 hover:shadow-lg transition">
                                        View Course
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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