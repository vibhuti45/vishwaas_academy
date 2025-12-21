"use client";
import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TakeQuiz({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Quiz State
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Access Control & User Data
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [realStudentName, setRealStudentName] = useState(""); // <--- NEW STATE

  // 1. Fetch Quiz, Check Attempts AND Fetch Student Name
  useEffect(() => {
    const init = async () => {
      if (!user) return;

      try {
        // A. FETCH REAL NAME FROM DB (Fixes the "Student" issue)
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            setRealStudentName(userDoc.data().name);
        } else {
            setRealStudentName(user.displayName || "Student");
        }

        // B. CHECK IF ALREADY ATTEMPTED
        const resultsRef = collection(db, "courses", courseId, "quizzes", quizId, "results");
        const q = query(resultsRef, where("studentId", "==", user.uid));
        const attemptSnap = await getDocs(q);

        if (!attemptSnap.empty) {
            // Found previous result
            const prevResult = attemptSnap.docs[0].data();
            setScore(prevResult.score);
            setSubmitted(true);
            setAlreadyAttempted(true);
            setCheckingAccess(false);
            
            // Fetch quiz data just for display (read-only)
            const quizSnap = await getDoc(doc(db, "courses", courseId, "quizzes", quizId));
            if (quizSnap.exists()) {
                setQuiz(quizSnap.data());
                setQuestions(quizSnap.data().questions || []);
            }
            return; 
        }

        // C. If NOT attempted, load quiz normally
        const snap = await getDoc(doc(db, "courses", courseId, "quizzes", quizId));
        if (snap.exists()) {
            const data = snap.data();
            setQuiz(data);
            setQuestions(data.questions || []);
            setTimeLeft(data.duration * 60);
        }
        setCheckingAccess(false);

      } catch (err) {
        console.error("Error loading quiz:", err);
      }
    };
    
    init();
  }, [courseId, quizId, user]);

  // 2. Timer Logic
  useEffect(() => {
    if (submitted || timeLeft <= 0 || !quiz || alreadyAttempted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
            handleSubmit(); 
            return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted, quiz, alreadyAttempted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIndex]: optIndex });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    let correctCount = 0;
    questions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) correctCount++;
    });

    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);

    if (user && quiz) {
        try {
            // Use the real name we fetched, or fallback to Auth name
            const nameToSave = realStudentName || user.displayName || "Student";

            // 1. Save Result to Course (For Faculty View)
            await addDoc(collection(db, "courses", courseId, "quizzes", quizId, "results"), {
                studentId: user.uid,
                studentName: nameToSave, // <--- SAVING CORRECT NAME HERE
                studentEmail: user.email,
                score: finalScore,
                correctAnswers: correctCount,
                totalQuestions: questions.length,
                submittedAt: new Date()
            });

            // 2. Save Result to User Profile (For Student View)
            await addDoc(collection(db, "users", user.uid, "results"), {
                quizTitle: quiz.title,
                courseId: courseId,
                quizId: quizId,
                score: finalScore,
                totalQuestions: questions.length,
                date: new Date()
            });

        } catch (err) {
            console.error("Error saving result:", err);
        }
    }
  };

  if (checkingAccess) return <div className="p-10 text-white bg-slate-900 min-h-screen">Checking permissions...</div>;
  if (!quiz) return <div className="p-10 text-white bg-slate-900 min-h-screen">Quiz not found.</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6">
      
      {/* HEADER */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-xl border border-slate-700 sticky top-4 z-10 shadow-lg">
        <div>
            <h1 className="font-bold text-xl">{quiz.title}</h1>
            {alreadyAttempted && <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">⚠ You have already taken this test</span>}
        </div>
        <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg ${submitted ? 'bg-slate-700 text-slate-400' : 'bg-slate-900 text-blue-400'}`}>
            {submitted ? "Finished" : formatTime(timeLeft)}
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="w-full max-w-3xl space-y-6 mb-20">
        {questions.map((q, qIdx) => {
            return (
                <div key={qIdx} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-semibold mb-4 flex gap-3"><span className="text-slate-500">Q{qIdx + 1}.</span> {q.question}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt: string, optIdx: number) => {
                            let optionClass = "bg-slate-900 border-slate-700 opacity-50"; 
                            
                            if (submitted) {
                                if (optIdx === q.correctAnswer) optionClass = "bg-green-900/40 border-green-500 text-green-200 font-bold";
                            } else {
                                if (answers[qIdx] === optIdx) optionClass = "bg-blue-600 border-blue-500 text-white ring-2 ring-blue-400 opacity-100";
                                else optionClass = "bg-slate-900 border-slate-700 hover:bg-slate-700 opacity-100";
                            }

                            return (
                                <button key={optIdx} disabled={submitted} onClick={() => handleSelect(qIdx, optIdx)} className={`text-left p-4 rounded-lg border transition ${optionClass}`}>
                                    <span className="font-bold mr-2 opacity-50">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        })}
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-800 border-t border-slate-700 p-4 flex justify-center z-20">
        {submitted ? (
             <div className="flex items-center gap-6 animate-in slide-in-from-bottom-5">
                <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase">Final Score</p>
                    <p className={`text-3xl font-bold ${score >= 40 ? 'text-green-400' : 'text-red-400'}`}>{score.toFixed(0)}%</p>
                </div>
                <Link href={`/classroom/${courseId}`}>
                    <button className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold">Back to Classroom</button>
                </Link>
             </div>
        ) : (
            <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-500 text-white px-12 py-3 rounded-lg font-bold text-lg shadow-lg">Submit Quiz</button>
        )}
      </div>
    </div>
  );
}