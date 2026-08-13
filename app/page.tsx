import Link from "next/link";
import { ArrowRight, Beaker } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <Beaker /> BioPortal
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" />
          <Link href="/login" className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-2 rounded-full font-medium hover:bg-slate-800 dark:hover:bg-white transition-all">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Scientific Data <span className="text-blue-600 dark:text-blue-400">Visual Management</span> Platform
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
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