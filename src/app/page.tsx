import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      
      {/* --- NAVBAR --- */}
      <header className="w-full border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <Image src="/logo.svg" alt="Vishwaas Logo" width={40} height={40} />
            <span className="text-xl font-bold text-blue-900 tracking-tight">Vishwaas Academy</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <Link href="/about" className="hover:text-blue-600 transition">About</Link>
            <Link href="#" className="hover:text-blue-600 transition">Courses</Link>
            <Link href="/faculty" className="hover:text-blue-600 transition">Faculty</Link>
            <Link href="/contact" className="hover:text-blue-600 transition">Contact</Link>
          </nav>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">
            Student Login
          </button>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="flex-grow">
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              Education Built on <span className="text-blue-600">Trust</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10">
              Vishwaas Academy provides world-class tutoring, interactive quizzes, 
              and a learning path designed to help you succeed.
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                Explore Courses
              </button>
              <button className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section className="bg-slate-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-2xl">📚</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Expert Material</h3>
                <p className="text-slate-600">Curated reading resources and notes tailored for your curriculum.</p>
              </div>
              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 text-2xl">🎥</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Video Lectures</h3>
                <p className="text-slate-600">High-quality video explanations you can watch anytime, anywhere.</p>
              </div>
              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 text-2xl">📝</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Interactive Quizzes</h3>
                <p className="text-slate-600">Test your knowledge with real-time quizzes and instant feedback.</p>
              </div>
            </div>
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