import Link from "next/link";
import { ArrowRight, Beaker } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <Beaker /> BioPortal
        </div>
        <Link href="/login" className="bg-slate-900 text-white px-6 py-2 rounded-full font-medium hover:bg-slate-800 transition-all">
          Sign In
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">
            Scientific Data <span className="text-blue-600">Visual Management</span> Platform
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Integrated tumor growth curves, survival analysis, and various bioinformatics charts to provide one-stop data decision support.
          </p>
          <div className="pt-10">
            <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 inline-flex items-center gap-2">
              Get Started Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}