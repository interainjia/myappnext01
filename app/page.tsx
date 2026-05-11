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
          登录系统
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">
            科学数据 <span className="text-blue-600">可视化管理</span> 平台
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            集成肿瘤生长曲线、生存分析及多种生物信息学图表，为您提供一站式的数据决策支持。
          </p>
          <div className="pt-10">
            <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 inline-flex items-center gap-2">
              立即开始使用 <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}