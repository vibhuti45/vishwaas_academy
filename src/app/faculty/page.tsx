import Image from "next/image";
import Link from "next/link";

// --- FACULTY DATA ---
const teachers = [
  {
    name: "Dr. Adarsh Anand",
    subject: "Biology",
    qualification: "BHMS (Medical Doctor), Dr. Halim MCH",
    bio: "With 10+ years of teaching experience, Adarsh makes complex biology concepts easy to visualize and understand.",
    image: "/faculty/adarsh.jpg" // Ensure you have adarsh.jpg in public/faculty folder
  },
  {
    name: "Mr. Alok Kumar",
    subject: "Mathematics",
    qualification: "BTech Electrical Engineering, IIT Bombay",
    bio: "Alok specializes in Vedic Maths and shortcut techniques that help students solve problems faster in exams.",
    image: "/faculty/alok.jpg"
  },
  {
    name: "Ms. Ruby Kumari",
    subject: "English & Literature",
    qualification: "BSc Nursing, DMCH Darbhanga",
    bio: "Ruby focuses on grammar foundations and creative writing, ensuring students excel in both spoken and written English.",
    image: "/faculty/ruby.jpg"
  },
  {
    name: "Mr. Ravi Prakash",
    subject: "Physics & Chemistry",
    qualification: "B.Tech Computer Science, PEC Chandigarh",
    bio: "Ravi uses real-life experiments and examples to explain chemical reactions and the periodic table.",
    image: "/faculty/ravi.jpg"
  },
  {
    name: "Mr. Ritesh Kumar",
    subject: "Management Studies",
    qualification: "MBA, IIM Ahmedabad",
    bio: "Ritesh brings management to life with practical techniques that make learning about the past engaging and memorable.",
    image: "/faculty/ritesh.jpg"
  },
  {
    name: "Mr. Ayush Ranjan Jha",
    subject: "Computer Science",
    qualification: "B.Tech Computer Science, DU",
    bio: "Ayush makes computer science exciting by teaching coding through fun projects and interactive lessons.",
    image: "/faculty/ayush.jpg"
  }
];

export default function Faculty() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      
      {/* --- NAVBAR --- */}
      <header className="w-full border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Vishwaas Logo" width={40} height={40} />
                <span className="text-xl font-bold text-blue-900 tracking-tight">Vishwaas Academy</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <Link href="/about" className="hover:text-blue-600 transition">About</Link>
            <Link href="#" className="hover:text-blue-600 transition">Courses</Link>
            <Link href="/faculty" className="text-blue-600 font-semibold">Faculty</Link>
            <Link href="/contact" className="hover:text-blue-600 transition">Contact</Link>
          </nav>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">
            Student Login
          </button>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="flex-grow bg-slate-50">
        <section className="py-20 text-center px-4">
            <h1 className="text-4xl font-bold text-slate-900 mb-6">Meet Our Mentors</h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600">
                Our faculty consists of experienced educators who are passionate about shaping the future. 
                We don't just teach; we inspire.
            </p>
        </section>

        {/* --- FACULTY GRID --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                {teachers.map((teacher, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col sm:flex-row gap-6 border border-slate-100">
                        
                        {/* IMAGE SECTION */}
                        <div className="w-24 h-24 relative flex-shrink-0 bg-slate-200 rounded-full overflow-hidden border border-slate-100">
                           {/* Make sure the images exist in public/faculty/ 
                              If an image is missing, this space will appear grey.
                           */}
                           <Image 
                             src={teacher.image} 
                             alt={teacher.name}
                             fill
                             className="object-cover"
                           />
                        </div>
                        
                        {/* INFO SECTION */}
                        <div className="flex-col flex justify-center">
                            <h3 className="text-xl font-bold text-slate-900">{teacher.name}</h3>
                            <span className="text-blue-600 font-medium text-sm mb-2 block">{teacher.subject}</span>
                            <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">{teacher.qualification}</p>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {teacher.bio}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* --- JOIN TEAM CTA --- */}
        <section className="bg-white py-16 border-t border-slate-200">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Are you a passionate teacher?</h2>
                <p className="text-slate-600 mb-8">We are always looking for expert educators to join our mission.</p>
                <Link href="/contact" className="text-blue-600 font-semibold hover:underline">
                    Contact us to apply &rarr;
                </Link>
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