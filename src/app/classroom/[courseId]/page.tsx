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
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  
  // --- DOUBT SYSTEM STATES ---
  const [doubts, setDoubts] = useState<any[]>([]);
  const [newDoubt, setNewDoubt] = useState("");
  const [doubtLoading, setDoubtLoading] = useState(false);

  // 1. Fetch Course Content & Doubts
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // A. Course Details
        const courseSnap = await getDoc(doc(db, "courses", courseId));
        if (courseSnap.exists()) setCourse(courseSnap.data());

        // B. Chapters
        const qChapters = query(collection(db, "courses", courseId, "chapters"), orderBy("createdAt", "asc"));
        const chapterSnap = await getDocs(qChapters);
        const fetchedChapters: any[] = [];
        chapterSnap.forEach((doc) => fetchedChapters.push({ id: doc.id, ...doc.data() }));
        setChapters(fetchedChapters);

        if (fetchedChapters.length > 0 && fetchedChapters[0].lessons?.length > 0) {
            setActiveLesson(fetchedChapters[0].lessons[0]);
        }

        // C. Fetch Doubts (Questions)
        // We order by time so newest is top
        const qDoubts = query(collection(db, "courses", courseId, "doubts"), orderBy("createdAt", "desc"));
        const doubtSnap = await getDocs(qDoubts);
        const fetchedDoubts: any[] = [];
        doubtSnap.forEach((doc) => fetchedDoubts.push({ id: doc.id, ...doc.data() }));
        setDoubts(fetchedDoubts);

      } catch (error) {
        console.error("Error loading classroom:", error);
      }
    };

    fetchData();
  }, [user, courseId]);

  // 2. Handle Sending a Doubt
  const handlePostDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubt.trim()) return;
    setDoubtLoading(true);

    try {
        const doubtData = {
            studentName: (user as any)?.displayName || "Student",
            studentId: user?.uid,
            question: newDoubt,
            lessonTitle: activeLesson?.title || "General", // Tag it with the current video
            createdAt: serverTimestamp(),
            status: "open", // Teacher hasn't replied yet
            reply: null
        };

        const docRef = await addDoc(collection(db, "courses", courseId, "doubts"), doubtData);
        
        // Update UI instantly
        setDoubts([{ id: docRef.id, ...doubtData, createdAt: new Date() }, ...doubts]);
        setNewDoubt("");
    } catch (error) {
        console.error("Error posting doubt:", error);
        alert("Failed to post question.");
    } finally {
        setDoubtLoading(false);
    }
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) return <div className="p-10 text-center text-white">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden">
      
      {/* HEADER */}
      <header className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-800 flex-shrink-0">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">&larr; Back</Link>
            <h1 className="font-bold text-lg truncate max-w-md">{course?.title}</h1>
        </div>
        <div className="text-sm text-slate-400">{(user as any)?.displayName || "Student"}</div>
      </header>

      <div className="flex flex-grow overflow-hidden flex-col md:flex-row">
        
        {/* LEFT: Player & Doubts (Scrollable) */}
        <div className="flex-grow flex flex-col overflow-y-auto custom-scrollbar">
            
            {/* VIDEO PLAYER SECTION */}
            <div className="bg-black min-h-[400px] flex items-center justify-center p-4">
                {activeLesson ? (
                    activeLesson.type === 'video' ? (
                        <div className="w-full max-w-4xl aspect-video bg-black shadow-2xl rounded-lg overflow-hidden border border-slate-800">
                            <iframe 
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${getYouTubeId(activeLesson.url)}?rel=0`}
                                title={activeLesson.title}
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <div className="text-center p-10">
                            <span className="text-6xl mb-4 block">📄</span>
                            <h2 className="text-2xl font-bold mb-4">{activeLesson.title}</h2>
                            <a href={activeLesson.url} target="_blank" className="bg-blue-600 px-6 py-3 rounded-lg font-bold">Open Document ↗</a>
                        </div>
                    )
                ) : <p className="text-slate-500">Select a lesson</p>}
            </div>

            {/* DOUBTS SECTION */}
            <div className="max-w-4xl w-full mx-auto p-6">
                <h3 className="text-xl font-bold mb-4">Discussion & Doubts</h3>
                
                {/* Ask Form */}
                <form onSubmit={handlePostDoubt} className="flex gap-4 mb-8">
                    <input 
                        type="text" 
                        value={newDoubt}
                        onChange={(e) => setNewDoubt(e.target.value)}
                        placeholder={`Ask a question about "${activeLesson?.title || 'this course'}"...`}
                        className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button disabled={doubtLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg disabled:opacity-50">
                        {doubtLoading ? "..." : "Post"}
                    </button>
                </form>

                {/* Doubts List */}
                <div className="space-y-4 pb-10">
                    {doubts.length === 0 ? (
                        <p className="text-slate-500 text-center italic">No questions yet. Be the first to ask!</p>
                    ) : (
                        doubts.map((doubt) => (
                            <div key={doubt.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-bold text-blue-400 text-sm">{doubt.studentName}</span>
                                        <span className="text-slate-500 text-xs ml-2">• on {doubt.lessonTitle}</span>
                                    </div>
                                    {doubt.status === "resolved" ? (
                                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">Resolved</span>
                                    ) : (
                                        <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded">Open</span>
                                    )}
                                </div>
                                <p className="text-slate-200 mb-3">{doubt.question}</p>
                                
                                {/* Teacher Reply */}
                                {doubt.reply && (
                                    <div className="bg-slate-700/50 p-3 rounded-lg border-l-4 border-green-500 ml-4">
                                        <p className="text-xs text-green-400 font-bold mb-1">Teacher's Answer:</p>
                                        <p className="text-sm text-slate-300">{doubt.reply}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* RIGHT: Playlist (Sidebar) */}
        <div className="w-full md:w-80 bg-slate-800 border-l border-slate-700 flex-shrink-0 flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b border-slate-700 bg-slate-800 sticky top-0">
                <h3 className="font-bold text-slate-300 uppercase text-xs tracking-wider">Course Content</h3>
            </div>
            <div className="p-2 space-y-4">
                {chapters.map((chapter) => (
                    <div key={chapter.id}>
                        <h4 className="font-bold text-white text-xs mb-2 px-2 mt-2 bg-slate-700/50 py-1 rounded">{chapter.title}</h4>
                        <div className="space-y-1">
                            {chapter.lessons?.map((lesson: any, index: number) => (
                                <button 
                                    key={index}
                                    onClick={() => setActiveLesson(lesson)}
                                    className={`w-full flex items-center gap-3 p-2 rounded text-left transition text-sm ${
                                        activeLesson === lesson ? "bg-blue-600 text-white" : "hover:bg-slate-700 text-slate-300"
                                    }`}
                                >
                                    <span className="text-xs">{lesson.type === 'video' ? '▶' : '📄'}</span>
                                    <span className="truncate">{lesson.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}