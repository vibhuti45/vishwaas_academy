"use client";
import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, orderBy, addDoc, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function Classroom({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { user, loading } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]); 
  const [activeLesson, setActiveLesson] = useState<any>(null);
  
  const [doubts, setDoubts] = useState<any[]>([]);
  const [newDoubt, setNewDoubt] = useState("");
  const [doubtLoading, setDoubtLoading] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const courseSnap = await getDoc(doc(db, "courses", courseId));
        if (courseSnap.exists()) setCourse(courseSnap.data());

        const qChapters = query(collection(db, "courses", courseId, "chapters"), orderBy("createdAt", "asc"));
        const chapterSnap = await getDocs(qChapters);
        const fetchedChapters: any[] = [];
        chapterSnap.forEach((doc) => fetchedChapters.push({ id: doc.id, ...doc.data() }));
        setChapters(fetchedChapters);

        if (fetchedChapters.length > 0 && fetchedChapters[0].lessons?.length > 0) {
            setActiveLesson(fetchedChapters[0].lessons[0]);
        }

        const qQuizzes = query(collection(db, "courses", courseId, "quizzes"), where("published", "==", true));
        const quizSnap = await getDocs(qQuizzes);
        const fetchedQuizzes: any[] = [];
        quizSnap.forEach((doc) => fetchedQuizzes.push({ id: doc.id, ...doc.data() }));
        setQuizzes(fetchedQuizzes);

        const qDoubts = query(collection(db, "courses", courseId, "doubts"), orderBy("createdAt", "desc"));
        const doubtSnap = await getDocs(qDoubts);
        const fetchedDoubts: any[] = [];
        doubtSnap.forEach((doc) => fetchedDoubts.push({ id: doc.id, ...doc.data() }));
        setDoubts(fetchedDoubts);

      } catch (error) { console.error(error); }
    };
    fetchData();
  }, [user, courseId]);

  const handlePostDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubt.trim()) return;
    setDoubtLoading(true);
    try {
        const doubtData = {
            studentName: (user as any)?.displayName || "Student",
            studentId: user?.uid,
            question: newDoubt,
            lessonTitle: activeLesson?.title || "General",
            createdAt: serverTimestamp(),
            status: "open",
            reply: null
        };
        const docRef = await addDoc(collection(db, "courses", courseId, "doubts"), doubtData);
        setDoubts([{ id: docRef.id, ...doubtData, createdAt: new Date() }, ...doubts]);
        setNewDoubt("");
    } catch (error) { console.error(error); } finally { setDoubtLoading(false); }
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Reusable Component for Doubts (to render in different places based on screen size)
  const DoubtsSection = () => (
    <div className="max-w-4xl w-full mx-auto p-6">
        <h3 className="text-xl font-bold mb-4">Discussion & Doubts</h3>
        <form onSubmit={handlePostDoubt} className="flex gap-4 mb-8">
            <input type="text" value={newDoubt} onChange={(e) => setNewDoubt(e.target.value)} placeholder="Ask a question..." className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" />
            <button disabled={doubtLoading} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg">{doubtLoading ? "..." : "Post"}</button>
        </form>
        <div className="space-y-4 pb-10">
            {doubts.map((doubt) => (
                <div key={doubt.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between mb-2"><span className="font-bold text-blue-400 text-sm">{doubt.studentName}</span></div>
                    <p className="text-slate-200 mb-2">{doubt.question}</p>
                    {doubt.reply && <div className="bg-slate-700/50 p-3 rounded-lg border-l-4 border-green-500 ml-4"><p className="text-xs text-green-400 font-bold mb-1">Teacher's Answer:</p><p className="text-sm text-slate-300">{doubt.reply}</p></div>}
                </div>
            ))}
        </div>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-white">Loading...</div>;

  return (
    // FIX: Removed 'h-screen' and 'overflow-hidden' for mobile. Only applied on md (desktop)
    <div className="flex flex-col min-h-screen md:h-screen bg-slate-900 text-white md:overflow-hidden">
      
      {/* HEADER */}
      <header className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-800 flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">&larr; Back</Link>
            <h1 className="font-bold text-lg truncate max-w-md">{course?.title}</h1>
        </div>
        <div className="text-sm text-slate-400">{(user as any)?.displayName || "Student"}</div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex flex-col md:flex-row flex-grow md:overflow-hidden">
        
        {/* LEFT COLUMN: Video Player + (Desktop Only) Doubts */}
        <div className="w-full md:flex-1 flex flex-col md:overflow-y-auto custom-scrollbar">
            
            {/* VIDEO PLAYER (Sticky on Mobile) */}
            <div className="bg-black min-h-[250px] md:min-h-[400px] flex items-center justify-center p-0 md:p-4 sticky top-0 z-30 md:static">
                {activeLesson ? (
                    activeLesson.type === 'video' ? (
                        <div className="w-full h-full md:max-w-4xl md:aspect-video bg-black shadow-2xl md:rounded-lg overflow-hidden border-b md:border border-slate-800 relative aspect-video">
                            <iframe 
                                className="absolute top-0 left-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${getYouTubeId(activeLesson.url)}?rel=0&playsinline=1&modestbranding=1`}
                                title={activeLesson.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <div className="text-center p-8 w-full bg-slate-800 md:rounded-xl border-b md:border border-slate-700">
                            <span className="text-5xl mb-4 block">📄</span>
                            <h2 className="text-xl font-bold mb-4 text-white">{activeLesson.title}</h2>
                            <a href={activeLesson.url} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
                                Open Document ↗
                            </a>
                        </div>
                    )
                ) : <p className="text-slate-500 p-10">Select a lesson to start</p>}
            </div>

            {/* DOUBTS (VISIBLE ONLY ON DESKTOP) */}
            <div className="hidden md:block">
                <DoubtsSection />
            </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Lessons) + (Mobile Only) Doubts */}
        <div className="w-full md:w-80 bg-slate-800 border-l border-slate-700 flex-shrink-0 flex flex-col md:h-full md:overflow-y-auto">
            
            {/* QUIZZES */}
            {quizzes.length > 0 && (
                <div className="p-4 border-b border-slate-700">
                    <h3 className="font-bold text-green-400 uppercase text-xs tracking-wider mb-3">⚡ Quizzes</h3>
                    <div className="space-y-2">
                        {quizzes.map(quiz => (
                            <Link key={quiz.id} href={`/classroom/${courseId}/quiz/${quiz.id}`}>
                                <div className="w-full flex items-center justify-between p-3 rounded-lg bg-green-900/20 border border-green-900/50 hover:bg-green-900/40 transition">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-lg">📝</span>
                                        <span className="truncate text-sm font-medium text-green-100">{quiz.title}</span>
                                    </div>
                                    <span className="text-xs text-green-400">{quiz.duration}m</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* CHAPTERS / LESSON LIST */}
            <div className="p-4 bg-slate-800 sticky top-0 border-b border-slate-700">
                <h3 className="font-bold text-slate-300 uppercase text-xs tracking-wider">Course Content</h3>
            </div>
            <div className="p-2 space-y-4 pb-8">
                {chapters.map((chapter) => (
                    <div key={chapter.id}>
                        <h4 className="font-bold text-white text-xs mb-2 px-2 mt-2 bg-slate-700/50 py-1 rounded">{chapter.title}</h4>
                        <div className="space-y-1">
                            {chapter.lessons?.map((lesson: any, index: number) => (
                                <button key={index} onClick={() => setActiveLesson(lesson)} className={`w-full flex items-center gap-3 p-3 rounded text-left transition text-sm ${activeLesson === lesson ? "bg-blue-600 text-white" : "bg-slate-800/50 hover:bg-slate-700 text-slate-300"}`}>
                                    <span className="text-xs">{lesson.type === 'video' ? '▶' : '📄'}</span>
                                    <span className="truncate">{lesson.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* DOUBTS (VISIBLE ONLY ON MOBILE - Below Lessons) */}
            <div className="block md:hidden border-t border-slate-700 mt-4">
                <DoubtsSection />
            </div>
        </div>

      </div>
    </div>
  );
}