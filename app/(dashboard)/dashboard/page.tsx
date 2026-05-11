"use client";
import { BarChart3, PieChart, Activity, Briefcase } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: '总项目数', value: '128', icon: Briefcase, color: 'text-blue-600' },
    { label: '活跃动物模型', value: '3,420', icon: Activity, color: 'text-emerald-600' },
    { label: '待处理分析', value: '12', icon: BarChart3, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-slate-50 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col items-center justify-center text-slate-400 border-dashed border-2">
        <PieChart size={48} className="mb-4 opacity-20" />
        <p>CanvasXpress 图表容器 (正在等待 API 数据...)</p>
        <button className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm transition-colors">
          刷新过滤器数据
        </button>
      </div>
    </div>
  );
}