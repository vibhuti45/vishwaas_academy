"use client";
import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

// 1. Unwrap params properly for Client Component
export default function CoursePublicDetails({ params }: { params: Promise<{ courseId: string }> }) {
  const unwrappedParams = use(params); // Next.js 15 way to unwrap params
  const courseId = unwrappedParams?.courseId;

  const [course, setCourse] = useState<any>(null);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 2. CRITICAL SAFETY CHECK: Stop if no ID
    if (!courseId) return;

    const fetchData = async () => {
      try {
        // A. Fetch Course
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (!courseSnap.exists()) {
            setError("Course not found.");
            setLoading(false);
            return;
        }

        const courseData = courseSnap.data();
        setCourse(courseData);

        // B. Fetch Faculty
        // Robust check: Handle missing arrays or strings
        let facultyIds: string[] = [];
        if (courseData.assignedFacultyIds && Array.isArray(courseData.assignedFacultyIds)) {
            facultyIds = courseData.assignedFacultyIds;
        } else if (courseData.assignedFacultyId) {
            facultyIds = [courseData.assignedFacultyId];
        }

        if (facultyIds.length > 0) {
            // Fetch safely
            const validIds = facultyIds.filter(id => id); // Remove null/empty strings
            const facultyPromises = validIds.map(id => getDoc(doc(db, "users", id)));
            const facultySnaps = await Promise.all(facultyPromises);
            const loadedFaculties = facultySnaps
                .filter(snap => snap.exists())
                .map(snap => ({ id: snap.id, ...snap.data() }));
            setFaculties(loadedFaculties);
        }

        // C. Fetch Syllabus
        const qChapters = query(collection(db, "courses", courseId, "chapters"), orderBy("createdAt", "asc"));
        const chapterSnap = await getDocs(qChapters);
        const chapterList: any[] = [];
        chapterSnap.forEach(doc => chapterList.push({ id: doc.id, ...doc.data() }));
        setChapters(chapterList);

      } catch (err: any) {
        console.error("Error fetching course details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // --- RENDERING STATES ---
  
  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">Loading...</div>;
  
  if (error || !course) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-500 gap-4">
        <p className="text-xl font-bold">{error || "Course not found"}</p>
        <Link href="/courses" className="text-blue-600 hover:underline">Return to Course List</Link>
    </div>
  );

  // Helper: Get Subjects safely
  const displaySubjects = Array.isArray(course.subjects) && course.subjects.length > 0 
      ? course.subjects 
      : [course.subject || "General"];

  // Helper: Get Thumbnail safely
  const displayThumbnail = course.thumbnail && typeof course.thumbnail === 'string' && course.thumbnail.startsWith("http")
      ? course.thumbnail
      : "https://placehold.co/600x400/png";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* --- HERO HEADER --- */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
            
            {/* Text Info */}
            <div>
                <span className="inline-block bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded text-xs uppercase mb-4 tracking-wider">
                    {course.grade || "Course"}
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                    {course.title || "Untitled Course"}
                </h1>
                
                {/* Subjects Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {displaySubjects.map((sub: string, idx: number) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                            #{sub}
                        </span>
                    ))}
                </div>

                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {course.description || "No description provided."}
                </p>

                <div className="flex gap-4">
                    <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition shadow-lg">
                        Contact to Enroll
                    </button>
                    <Link href="/courses">
                        <button className="px-8 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">
                            Back to Courses
                        </button>
                    </Link>
                </div>
            </div>

            {/* Thumbnail Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
                 <Image 
                    src={displayThumbnail} 
                    alt={course.title || "Course"}
                    fill
                    className="object-cover"
                 />
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-12">
        
        {/* --- LEFT COLUMN: SYLLABUS --- */}
        <div className="lg:col-span-2 space-y-10">
            
            {/* Syllabus Section */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span>📚</span> Course Syllabus
                </h2>
                
                {chapters.length === 0 ? (
                    <p className="text-slate-500 italic">Syllabus is being updated.</p>
                ) : (
                    <div className="space-y-3">
                        {chapters.map((chapter, index) => (
                            <div key={chapter.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="bg-blue-100 text-blue-600 font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm flex-shrink-0">
                                    {index + 1}
                                </span>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{chapter.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Includes {chapter.lessons?.length || 0} lessons
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Features */}
            <section className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-2">🎥 High Quality Lectures</h3>
                    <p className="text-blue-700/70 text-sm">Access recorded sessions anytime, anywhere on your device.</p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                    <h3 className="font-bold text-green-900 mb-2">📝 Regular Quizzes</h3>
                    <p className="text-green-700/70 text-sm">Test your knowledge with chapter-wise assessments.</p>
                </div>
            </section>
        </div>

        {/* --- RIGHT COLUMN: FACULTY & INFO --- */}
        <div className="space-y-8">
            
            {/* Faculty Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">👨‍🏫 Your Mentors</h3>
                
                {faculties.length === 0 ? (
                    <p className="text-slate-500 text-sm">Faculty details coming soon.</p>
                ) : (
                    <div className="space-y-4">
                        {faculties.map(fac => (
                            <div key={fac.id} className="flex items-center gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xl">
                                    {fac.name ? fac.name.charAt(0) : "T"}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{fac.name}</p>
                                    <p className="text-xs text-purple-600 font-bold uppercase">{fac.department || "Faculty"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-bold mb-4 text-lg">Ready to start?</h3>
                <p className="text-slate-400 text-sm mb-6">
                    Enrollment is currently managed by our administration team.
                </p>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-blue-400">📞</span>
                        <span>+91 7324962717</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-blue-400">📧</span>
                        <span>vishwaasacademy@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-blue-400">📍</span>
                        <span>HeadQuarter, Rambagh, Darbhanga</span>
                    </div>
                </div>
            </div>

        </div>

      </main>
    </div>
  );
}