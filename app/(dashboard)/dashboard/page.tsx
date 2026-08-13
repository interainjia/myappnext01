"use client";
import { BarChart3, PieChart, Activity, Briefcase } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Projects', value: '128', icon: Briefcase, color: 'text-blue-600' },
    { label: 'Active Animal Models', value: '3,420', icon: Activity, color: 'text-emerald-600' },
    { label: 'Pending Analysis', value: '12', icon: BarChart3, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-96 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-dashed border-2">
        <PieChart size={48} className="mb-4 opacity-20" />
        <p>CanvasXpress Chart Container (Waiting for API data...)</p>
        <button className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm transition-colors">
          Refresh Filter Data
        </button>
      </div>
    </div>
  );
}