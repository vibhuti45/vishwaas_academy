import Image from "next/image";
import Navbar from "@/components/Navbar";

// --- LEADERSHIP DATA ---
// Update these details with real names and photos
const leaders = [
  {
    name: "Dr. Adarsh Anand",
    role: "Founder & CEO",
    qualification: "BHMS (Medical Doctor), Dr. Halim MCH",
    image: "/faculty/adarsh.jpg", // Make sure this exists in public/team/
    bio: "Driven by a passion for equitable education, Mr. Kumar founded Vishwaas Academy to bridge the gap between potential and performance. His vision is to make premium quality education accessible to every student in India."
  },
  {
    name: "Ms. Ruby Kumari",
    role: "Co-Founder & Academic Director",
    qualification: "BSc. Nursing, DMCH",
    image: "/faculty/ruby.jpg",
    bio: "With over 15 years of academic experience, she ensures that our curriculum remains cutting-edge and student-friendly. She leads the content strategy and teacher training programs."
  },
  {
    name: "Mr. Ritesh Kumar",
    role: "Head of Operations",
    qualification: "MBA, IIM Ahmedabad",
    image: "/faculty/ritesh.jpg",
    bio: "Responsible for the seamless day-to-day functioning of the academy, ensuring that students and parents have a hassle-free experience from admission to examination."
  }
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      
      {/* --- NAVBAR --- */}
      <Navbar />

      {/* --- HERO / SUMMARY SECTION --- */}
      <main className="flex-grow">
        
        {/* 1. Institute Summary */}
        <section className="bg-slate-50 py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-8">About Vishwaas Academy</h1>
                
                <div className="text-lg text-slate-700 leading-relaxed space-y-6 text-left md:text-center">
                    <p>
                        Established in 2024, <span className="font-bold text-blue-600">Vishwaas Academy</span> was born out of a simple idea: 
                        Education should be built on trust. We recognized that students today face immense pressure, 
                        often losing confidence in the race for grades.
                    </p>
                    <p>
                        We are not just a coaching institute; we are a mentorship platform. We combine 
                        <span className="font-semibold"> traditional teaching values</span> with <span className="font-semibold">modern technology </span> 
                        to create a learning environment that is engaging, effective, and empathetic.
                    </p>
                    <p>
                        Our mission is to empower students with the "Vishwaas" (Confidence) to tackle any academic challenge, 
                        be it School Boards, Olympiads, or Competitive Exams.
                    </p>
                </div>
            </div>
        </section>

        {/* 2. Mission & Vision Grid */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-blue-600 text-white p-10 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <span className="text-3xl">🚀</span> Our Mission
                    </h2>
                    <p className="opacity-90 leading-relaxed">
                        To democratize high-quality education by providing affordable, accessible, and personalized 
                        learning resources to students across the country, ensuring no talent goes unrecognized due to lack of guidance.
                    </p>
                </div>
                <div className="bg-slate-900 text-white p-10 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <span className="text-3xl">👁️</span> Our Vision
                    </h2>
                    <p className="opacity-90 leading-relaxed">
                        To become India's most trusted education partner, where every student feels valued, understood, 
                        and inspired to achieve their full potential through a holistic learning approach.
                    </p>
                </div>
            </div>
        </section>

        {/* 3. Leadership Team */}
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900">Meet Our Leadership</h2>
                    <p className="text-slate-600 mt-4">The visionaries guiding our path.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {leaders.map((leader, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            {/* Image Circle with Border Effect */}
                            <div className="w-48 h-48 relative mb-6 rounded-full overflow-hidden border-4 border-slate-100 group-hover:border-blue-100 transition duration-300 shadow-sm">
                                <Image 
                                    src={leader.image} 
                                    alt={leader.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            
                            {/* Content */}
                            <h3 className="text-xl font-bold text-slate-900">{leader.name}</h3>
                            <span className="text-blue-600 font-semibold text-sm mb-2 block">{leader.role}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">{leader.qualification}</span>
                            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                                {leader.bio}
                            </p>
                        </div>
                    ))}
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