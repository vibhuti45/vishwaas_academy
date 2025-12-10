import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      
      {/* --- NAVBAR (Same as Home) --- */}
      <Navbar />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow">
        {/* Mission Section */}
        <section className="bg-slate-50 py-20">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h1 className="text-4xl font-bold text-blue-900 mb-6">Our Mission</h1>
                <p className="text-xl text-slate-700 leading-relaxed">
                    At Vishwaas Academy, we believe education is not just about passing exams—it is about building 
                    <span className="font-bold text-blue-600"> confidence</span> and <span className="font-bold text-blue-600">trust</span> in one's own abilities. 
                    Our goal is to provide high-quality, accessible education to every student, regardless of their background.
                </p>
            </div>
        </section>

        {/* Story / Values Section */}
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Why "Vishwaas"?</h2>
                    <p className="text-slate-600 mb-4">
                        The word <em>Vishwaas</em> means Trust. In an era of information overload, students need a mentor they can rely on. 
                        We started this academy to be that reliable partner in your academic journey.
                    </p>
                    <ul className="space-y-3 mt-6">
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 text-xl">✓</span> <span className="text-slate-700">Transparency in teaching methods.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 text-xl">✓</span> <span className="text-slate-700">Commitment to student success.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 text-xl">✓</span> <span className="text-slate-700">Affordable and accessible resources.</span>
                        </li>
                    </ul>
                </div>
                {/* Placeholder for an image - using a gray box for now */}
                <div className="h-64 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                    [Team / Classroom Image Placeholder]
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