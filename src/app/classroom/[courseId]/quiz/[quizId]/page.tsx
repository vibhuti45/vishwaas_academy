"use client";
import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
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
  const [resultData, setResultData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Access Control & User Data
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [realStudentName, setRealStudentName] = useState("");

  // 1. Fetch Quiz, Check Attempts AND Fetch Student Name
  useEffect(() => {
    const init = async () => {
      if (!user) return;

      try {
        // A. FETCH REAL NAME
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setRealStudentName(userDoc.exists() ? userDoc.data().name : (user.displayName || "Student"));

        // B. CHECK IF ALREADY ATTEMPTED
        // We look in 'submissions' subcollection now (renamed from 'results' for clarity)
        // Check both collections for backward compatibility if needed, but sticking to 'submissions'
        const resultsRef = collection(db, "courses", courseId, "quizzes", quizId, "submissions");
        const q = query(resultsRef, where("studentId", "==", user.uid));
        const attemptSnap = await getDocs(q);

        if (!attemptSnap.empty) {
            const prevResult = attemptSnap.docs[0].data();
            
            setResultData({
                score: prevResult.score,
                maxScore: prevResult.maxScore,
                percentage: prevResult.percentage,
                correctCount: prevResult.correctCount,
                wrongCount: prevResult.wrongCount,
                answers: prevResult.answers || {} // Restore their answers to show coloring
            });
            setAnswers(prevResult.answers || {});
            setSubmitted(true);
            setAlreadyAttempted(true);
            
            // Load quiz just for display
            const quizSnap = await getDoc(doc(db, "courses", courseId, "quizzes", quizId));
            if (quizSnap.exists()) {
                setQuiz(quizSnap.data());
                setQuestions(quizSnap.data().questions || []);
            }
            setCheckingAccess(false);
            return; 
        }

        // C. If NOT attempted, load quiz normally
        const snap = await getDoc(doc(db, "courses", courseId, "quizzes", quizId));
        if (snap.exists()) {
            const data = snap.data();
            setQuiz(data);
            setQuestions(data.questions || []);
            setTimeLeft((data.duration || 30) * 60); // Default 30 mins if not set
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
    if (submitted || !quiz) return;
    setSubmitted(true);

    // --- NEW SCORING LOGIC ---
    let correctCount = 0;
    let wrongCount = 0;
    let attemptedCount = 0;

    const positiveMarks = Number(quiz.marksPerQuestion) || 1;
    const negativeMarks = Number(quiz.negativeMarks) || 0;

    questions.forEach((q, idx) => {
        const selected = answers[idx]; // undefined if not answered
        
        // Handle backward compatibility for key names (correctOption vs correctAnswer)
        const correctOptIndex = q.correctOption !== undefined ? q.correctOption : q.correctAnswer;

        if (selected !== undefined && selected !== -1) {
            attemptedCount++;
            if (selected === correctOptIndex) {
                correctCount++;
            } else {
                wrongCount++;
            }
        }
    });

    const totalScore = (correctCount * positiveMarks) - (wrongCount * negativeMarks);
    const maxPossibleScore = questions.length * positiveMarks;
    const percentage = maxPossibleScore > 0 ? ((totalScore / maxPossibleScore) * 100).toFixed(1) : "0";

    const finalResult = {
        score: totalScore,
        maxScore: maxPossibleScore,
        percentage,
        correctCount,
        wrongCount,
        attemptedCount,
        answers // Save user choices
    };

    setResultData(finalResult);

    if (user) {
        try {
            const nameToSave = realStudentName || user.displayName || "Student";

            // 1. Save to Course Submissions
            await addDoc(collection(db, "courses", courseId, "quizzes", quizId, "submissions"), {
                studentId: user.uid,
                studentName: nameToSave,
                studentEmail: user.email,
                ...finalResult,
                submittedAt: serverTimestamp()
            });

            // 2. Save to User Profile
            await addDoc(collection(db, "users", user.uid, "results"), {
                quizTitle: quiz.title,
                courseId,
                quizId,
                score: totalScore,
                percentage,
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
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-xl border border-slate-700 sticky top-4 z-20 shadow-lg">
        <div>
            <h1 className="font-bold text-xl">{quiz.title}</h1>
            {alreadyAttempted && <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">⚠ Result View</span>}
        </div>
        <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg ${submitted ? 'bg-slate-700 text-slate-400' : 'bg-slate-900 text-blue-400'}`}>
            {submitted ? "Finished" : formatTime(timeLeft)}
        </div>
      </div>

      {/* --- RESULT SUMMARY PANEL (Only show after submit) --- */}
      {submitted && resultData && (
          <div className="w-full max-w-4xl bg-slate-800 p-6 rounded-xl border border-slate-600 mb-8 animate-in fade-in zoom-in duration-300">
              <h2 className="text-xl font-bold mb-4 text-center">Quiz Result</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-xs text-slate-400 uppercase">Score</p>
                      <p className="text-2xl font-bold text-blue-400">{resultData.score} <span className="text-sm text-slate-500">/ {resultData.maxScore}</span></p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-xs text-slate-400 uppercase">Percentage</p>
                      <p className="text-2xl font-bold text-white">{resultData.percentage}%</p>
                  </div>
                  <div className="bg-green-900/20 p-3 rounded border border-green-900/50">
                      <p className="text-xs text-green-400 uppercase">Correct</p>
                      <p className="text-2xl font-bold text-green-400">{resultData.correctCount}</p>
                  </div>
                  <div className="bg-red-900/20 p-3 rounded border border-red-900/50">
                      <p className="text-xs text-red-400 uppercase">Wrong</p>
                      <p className="text-2xl font-bold text-red-400">{resultData.wrongCount}</p>
                  </div>
              </div>
          </div>
      )}

      {/* QUESTIONS LIST */}
      <div className="w-full max-w-4xl space-y-6 mb-24">
        {questions.map((q, qIdx) => {
            const userSelected = answers[qIdx]; // Index selected by user
            const correctOptIdx = q.correctOption !== undefined ? q.correctOption : q.correctAnswer;
            
            // Determine Card Border Color based on result
            let cardBorder = "border-slate-700";
            if (submitted) {
                if (userSelected === correctOptIdx) cardBorder = "border-green-600 shadow-[0_0_15px_rgba(34,197,94,0.2)]"; // Correct
                else if (userSelected !== undefined && userSelected !== correctOptIdx) cardBorder = "border-red-600"; // Wrong
                else cardBorder = "border-slate-600"; // Skipped
            }

            return (
                <div key={qIdx} className={`bg-slate-800 p-6 rounded-xl border-2 transition-all ${cardBorder}`}>
                    <h3 className="text-lg font-semibold mb-4 flex gap-3">
                        <span className="text-slate-500">Q{qIdx + 1}.</span> 
                        <span>{q.question || q.text}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt: string, optIdx: number) => {
                            let optionClass = "bg-slate-900 border-slate-700 text-slate-300"; // Default state
                            let icon = null;

                            if (submitted) {
                                // 1. Always highlight the CORRECT answer in GREEN
                                if (optIdx === correctOptIdx) {
                                    optionClass = "bg-green-900/40 border-green-500 text-green-100 font-bold ring-1 ring-green-500";
                                    icon = "✅";
                                }
                                // 2. Highlight the WRONG selection in RED
                                else if (userSelected === optIdx) {
                                    optionClass = "bg-red-900/40 border-red-500 text-red-100 font-bold ring-1 ring-red-500";
                                    icon = "❌";
                                }
                                // 3. Dim other options
                                else {
                                    optionClass = "bg-slate-900 border-slate-800 text-slate-600 opacity-50";
                                }
                            } else {
                                // TAKING QUIZ STATE
                                if (answers[qIdx] === optIdx) {
                                    optionClass = "bg-blue-600 border-blue-500 text-white ring-2 ring-blue-400 shadow-lg";
                                } else {
                                    optionClass = "bg-slate-900 border-slate-700 hover:bg-slate-700 hover:border-slate-500";
                                }
                            }

                            return (
                                <button 
                                    key={optIdx} 
                                    disabled={submitted} 
                                    onClick={() => handleSelect(qIdx, optIdx)} 
                                    className={`text-left p-4 rounded-lg border transition flex justify-between items-center ${optionClass}`}
                                >
                                    <div>
                                        <span className="font-bold mr-2 opacity-60">{String.fromCharCode(65 + optIdx)}.</span> 
                                        {opt}
                                    </div>
                                    {icon && <span>{icon}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        })}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-800 border-t border-slate-700 p-4 flex justify-center z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        {submitted ? (
             <Link href={`/classroom/${courseId}`}>
                <button className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold transition">
                    &larr; Back to Classroom
                </button>
             </Link>
        ) : (
            <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-500 text-white px-12 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-green-500/20 transition transform hover:scale-105">
                Submit Quiz
            </button>
        )}
      </div>
    </div>
  );
}