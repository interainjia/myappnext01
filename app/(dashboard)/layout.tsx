import React from 'react';
import { LayoutDashboard, Users, Settings, LogOut, Database } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const menuItems = [
    { icon: LayoutDashboard, label: '概览', active: true },
    { icon: Database, label: '数据分析' },
    { icon: Users, label: '团队管理' },
    { icon: Settings, label: '系统设置' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 text-white text-xl font-bold border-b border-slate-800">
          BioPortal
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, idx) => (
            <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors ${item.active ? 'bg-blue-600 text-white' : ''}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 cursor-pointer hover:bg-red-900/20 hover:text-red-400 flex items-center gap-3">
          <LogOut size={20} /> 退出登录
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">DSB</div>
            <span className="text-sm font-medium">Administrator</span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}