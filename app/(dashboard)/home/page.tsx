"use client";

import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
  }, []);

  const stats = [
    { label: 'Active Projects', value: '12', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Reviews', value: '5', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completion Rate', value: '84%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Next Milestone', value: 'Oct 24', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const quickLinks = [
    { name: 'View Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Analyze real-time data and charts' },
    { name: 'Manage Projects', href: '/projects', icon: Briefcase, description: 'Browse and edit your project list' },
    { name: 'System Config', href: '/configuration', icon: Settings, description: 'Manage platform settings (Admin only)' },
    { name: 'User Management', href: '/configuration/users', icon: Users, description: 'Control user access and roles' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, <span className="text-[#4db694]">{userName}</span>!
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4db694] hover:bg-[#3da583] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#4db694]/20"
        >
          Go to Dashboard <ArrowRight size={18} />
        </Link>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Links Section */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickLinks.map((link, i) => (
            <Link 
              key={i} 
              href={link.href}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-[#4db694] hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-[#4db694]/10 group-hover:text-[#4db694] rounded-xl flex items-center justify-center shrink-0 transition-colors">
                <link.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#4db694] transition-colors">
                  {link.name}
                </h3>
                <p className="text-slate-500 mt-1">{link.description}</p>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity self-center">
                <ArrowRight size={20} className="text-[#4db694]" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity / Updates Placeholder */}
      <section className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Platform Update</h2>
          <p className="text-slate-400 max-w-xl">
            Version 2.0 is now live! We&apos;ve added new survival analysis charts and improved data export performance for large datasets.
          </p>
          <button className="mt-6 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
            Learn More
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4db694] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
      </section>
    </div>
  );
}
