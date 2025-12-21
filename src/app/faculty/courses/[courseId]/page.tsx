"use client";
import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, getDocs, query, orderBy, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

// Define strict types for our data
type Lesson = {
  title: string;
  type: "video" | "pdf";
  url: string;
};

type Chapter = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export default function CourseEditor({ params }: { params: Promise<{ courseId: string }> }) {
  // Unwrap params using React.use()
  const { courseId } = use(params);

  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [courseTitle, setCourseTitle] = useState("Loading...");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  // Input States
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null); // Which chapter is being edited?
  const [newLesson, setNewLesson] = useState({ title: "", type: "video" as "video"|"pdf", url: "" });

  // 1. Fetch Course & Chapters
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
        // A. Verify Course Ownership
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
            setCourseTitle(courseSnap.data().title);
            // Optional: Check if assignedFacultyId === user.uid to prevent hacking
        }

        // B. Fetch Chapters (Sub-collection)
        const q = query(collection(db, "courses", courseId, "chapters"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedChapters: any[] = [];
        querySnapshot.forEach((doc) => {
            fetchedChapters.push({ id: doc.id, ...doc.data() });
        });
        setChapters(fetchedChapters);
    };

    fetchData();
  }, [user, courseId]);

  // 2. Add New Chapter
  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle) return;

    try {
        const docRef = await addDoc(collection(db, "courses", courseId, "chapters"), {
            title: newChapterTitle,
            lessons: [],
            createdAt: new Date()
        });

        // Update UI immediately
        setChapters([...chapters, { id: docRef.id, title: newChapterTitle, lessons: [] }]);
        setNewChapterTitle("");
    } catch (error) {
        console.error("Error adding chapter:", error);
    }
  };

  // 3. Add Lesson to Chapter
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChapterId || !newLesson.title || !newLesson.url) return;

    try {
        const chapterRef = doc(db, "courses", courseId, "chapters", activeChapterId);
        
        // Update Firestore
        await updateDoc(chapterRef, {
            lessons: arrayUnion(newLesson)
        });

        // Update UI locally (complex but faster than re-fetching)
        setChapters(chapters.map(ch => {
            if (ch.id === activeChapterId) {
                return { ...ch, lessons: [...ch.lessons, newLesson] };
            }
            return ch;
        }));

        setNewLesson({ title: "", type: "video", url: "" }); // Reset form
        setActiveChapterId(null); // Close form
    } catch (error) {
        console.error("Error adding lesson:", error);
    }
  };

  if (loading) return <div className="p-10">Loading Editor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <div>
            <Link href="/faculty/dashboard" className="text-sm text-slate-500 hover:text-blue-600 mb-1 block">&larr; Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-slate-900">{courseTitle}</h1>
            <p className="text-slate-500">Syllabus & Content Manager</p>
        </div>
        <button className="bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50">
            Preview Course
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Add Chapter */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-10">
                <h3 className="font-bold text-lg mb-4">Add New Module</h3>
                <form onSubmit={handleAddChapter} className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="e.g. Chapter 1: Algebra" 
                        className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-blue-700">
                        + Create Chapter
                    </button>
                </form>
            </div>
        </div>

        {/* RIGHT COLUMN: Chapter List */}
        <div className="lg:col-span-2 space-y-6">
            
            {chapters.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-xl">
                    <p className="text-slate-400">No chapters yet. Create one on the left!</p>
                </div>
            )}

            {chapters.map((chapter) => (
                <div key={chapter.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Chapter Title Bar */}
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">{chapter.title}</h3>
                        <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">{chapter.lessons?.length || 0} Lessons</span>
                    </div>

                    {/* Lessons List */}
                    <div className="p-4 space-y-2">
                        {chapter.lessons && chapter.lessons.map((lesson, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg group">
                                <span className="text-xl">{lesson.type === 'video' ? '🎥' : '📄'}</span>
                                <div className="flex-grow">
                                    <p className="text-sm font-medium text-slate-900">{lesson.title}</p>
                                    <a href={lesson.url} target="_blank" className="text-xs text-blue-500 hover:underline truncate block max-w-[200px]">{lesson.url}</a>
                                </div>
                            </div>
                        ))}

                        {/* Add Lesson Button / Form */}
                        {activeChapterId === chapter.id ? (
                            <form onSubmit={handleAddLesson} className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-sm font-bold text-blue-900 mb-2">Add Content to {chapter.title}</h4>
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Lesson Title (e.g. Intro to Algebra)" 
                                        className="w-full border p-2 rounded text-sm"
                                        value={newLesson.title}
                                        onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                                    />
                                    <div className="flex gap-2">
                                        <select 
                                            className="border p-2 rounded text-sm bg-white"
                                            value={newLesson.type}
                                            onChange={(e) => setNewLesson({...newLesson, type: e.target.value as any})}
                                        >
                                            <option value="video">Video (YouTube)</option>
                                            <option value="pdf">Note (PDF)</option>
                                        </select>
                                        <input 
                                            type="url" 
                                            required 
                                            placeholder="Paste URL here..." 
                                            className="flex-grow border p-2 rounded text-sm"
                                            value={newLesson.url}
                                            onChange={(e) => setNewLesson({...newLesson, url: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded hover:bg-blue-700">Add</button>
                                        <button type="button" onClick={() => setActiveChapterId(null)} className="text-slate-500 text-sm px-3 hover:text-slate-700">Cancel</button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <button 
                                onClick={() => setActiveChapterId(chapter.id)}
                                className="w-full py-2 mt-2 border-2 border-dashed border-slate-200 text-slate-400 text-sm font-semibold rounded-lg hover:border-blue-400 hover:text-blue-500 transition"
                            >
                                + Add Video or PDF
                            </button>
                        )}
                    </div>
                </div>
            ))}

        </div>
      </div>
    </div>
  );
}