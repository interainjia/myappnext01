"use client";

import React from 'react';
import { Table, Plus, Search, Filter } from 'lucide-react';

export default function ProjectListPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Project List</h1>
          <p className="text-slate-500 mt-1">Manage and track all scientific research projects.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#4db694] hover:bg-[#3da583] text-white rounded-lg font-medium transition-colors shadow-sm">
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4db694]/20 focus:border-[#4db694] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {/* Empty State / Table Placeholder */}
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Table size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No projects found</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-1">
            It looks like you haven&apos;t created any projects yet. Click the button above to start your first one.
          </p>
        </div>
      </div>
    </div>
  );
}
