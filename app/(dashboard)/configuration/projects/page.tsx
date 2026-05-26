"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Search, RefreshCw, X, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// === 1. Type Definitions ===
interface UserProjectRow {
  tid?: number; // 设置为可选，防止后端未返回
  eid: string;
  userName: string;
  projectNo: string;
}

interface Project {
  tid: number;
  projectNo: string;
}

export default function UserProjectListPage() {
  // === State Management ===
  const [data, setData] = useState<UserProjectRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // ✅ 修复 1：使用唯一的 eid 作为选中标识，而不是可能为空的 tid
  const [selectedEid, setSelectedEid] = useState<string | null>(null);
  
  // Pagination
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [searchEid, setSearchEid] = useState("");
  const [searchProjectNo, setSearchProjectNo] = useState("");
  
  // Available Projects (for Checkbox List)
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [saving, setSaving] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({ eid: '' });
  const [selectedProjectNos, setSelectedProjectNos] = useState<Set<string>>(new Set());

  const router = useRouter();

  const handleUnauthorized = () => {
    console.warn("Unauthorized. Redirecting to login...");
    localStorage.removeItem('token');
    router.push('/login');
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/Account/projects`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.status === 401) return handleUnauthorized();
      
      const result = await res.json();
      setAvailableProjects(result.rows || result.data || result || []);
    } catch (error) {
      console.error("Fetch available projects failed:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/Account/projects/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          pageIndex,
          pageSize,
          UserName: searchName.trim(),
          Eid: searchEid.trim(),
          ProjectNo: searchProjectNo.trim()
        })
      });
      
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Fetch data failed");
      
      const result = await res.json();
      
      setData(result.rows || result.data || []);
      setTotal(result.total || result.totalCount || 0);
      setSelectedEid(null); // 刷新后清除选中状态
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  // ✅ 修复 2：统一搜索触发器，确保搜索时页码回到第一页
  const handleSearchTrigger = () => {
    if (pageIndex !== 1) {
      setPageIndex(1);
    } else {
      fetchData();
    }
  };

  const handleOpenModal = (mode: 'add' | 'edit') => {
    if (mode === 'edit' && !selectedEid) {
      alert("Please select a user first!");
      return;
    }

    setModalMode(mode);
    
    if (mode === 'add') {
      setFormData({ eid: '' });
      setSelectedProjectNos(new Set());
    } else {
      const targetRow = data.find(r => r.eid === selectedEid);
      if (targetRow) {
        setFormData({ eid: targetRow.eid });
        const projectArray = (targetRow.projectNo || '').split(',').map(p => p.trim()).filter(Boolean);
        setSelectedProjectNos(new Set(projectArray));
      }
    }
    
    setIsModalOpen(true);
  };

  const handleToggleProject = (projectNo: string, checked: boolean) => {
    const newSet = new Set(selectedProjectNos);
    if (checked) {
      newSet.add(projectNo);
    } else {
      newSet.delete(projectNo);
    }
    setSelectedProjectNos(newSet);
  };

  const handleSave = async () => {
    if (!formData.eid.trim()) {
      alert("Please input Account ID!");
      return;
    }

    if (selectedProjectNos.size === 0) {
      alert("Please select at least one Project!");
      return;
    }

    setSaving(true);
    try {
      const projectNoString = Array.from(selectedProjectNos).join(',');

      const res = await fetch(`${API_BASE}/api/Account/projects/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          Eid: formData.eid,
          ProjectNo: projectNoString
        })
      });
      
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Save failed");
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save user projects.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      
      {/* Top Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        
        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal('add')} className="flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
            <Plus size={16} /> Create
          </button>
          <button onClick={() => handleOpenModal('edit')} className="flex items-center gap-1.5 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium">
            <Pencil size={16} /> Edit
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <input 
              type="text" 
              placeholder="User Name" 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
              className="pl-9 pr-4 py-2 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Account ID" 
              value={searchEid}
              onChange={(e) => setSearchEid(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
              className="pl-9 pr-4 py-2 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Project No." 
              value={searchProjectNo}
              onChange={(e) => setSearchProjectNo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
              className="pl-9 pr-4 py-2 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          
          <button onClick={handleSearchTrigger} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">
            Search
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-12 text-center"></th>
                <th className="px-6 py-4 w-[15%] text-sm font-semibold text-slate-600">Account ID</th>
                <th className="px-6 py-4 w-[15%] text-sm font-semibold text-slate-600">User Name</th>
                <th className="px-6 py-4 w-[70%] text-sm font-semibold text-slate-600">Project No</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-slate-400" size={24} /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-slate-500">No data available</td></tr>
              ) : (
                data.map(row => (
                  <tr 
                    key={row.eid} 
                    onClick={() => setSelectedEid(row.eid)}
                    className={`border-b border-slate-50 cursor-pointer transition-colors ${selectedEid === row.eid ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="radio" 
                        name="rowSelection"
                        checked={selectedEid === row.eid} 
                        onChange={() => setSelectedEid(row.eid)}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.eid}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{row.userName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-normal break-words max-w-xl leading-relaxed">
                      {row.projectNo ? (
                        row.projectNo.split(',').map((proj, idx) => (
                          <span key={idx} className="inline-block bg-slate-100 border border-slate-200 text-slate-900 rounded px-2 py-0.5 text-xs mr-1.5 mb-1.5">
                            {proj.trim()}
                          </span>
                        ))
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-sm text-slate-500">Total {total} records</span>
          <div className="flex gap-2 items-center">
            <select 
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(1); }}
              className="px-2 py-1 border border-slate-200 text-slate-900 rounded text-sm bg-white"
            >
              {[10, 25, 50, 75, 100].map(size => <option key={size} value={size}>{size} per page</option>)}
            </select>
            <button 
              disabled={pageIndex === 1} 
              onClick={() => setPageIndex(p => Math.max(1, p - 1))}
              className="px-3 py-1 border border-slate-200 text-slate-900 rounded text-sm bg-white disabled:opacity-50 hover:bg-slate-100"
            >
              Previous
            </button>
            <button 
              disabled={pageIndex * pageSize >= total} 
              onClick={() => setPageIndex(p => p + 1)}
              className="px-3 py-1 border border-slate-200 text-slate-900 rounded text-sm bg-white disabled:opacity-50 hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* === Modal: Add / Edit User Project === */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {modalMode === 'add' ? 'Add User Project' : 'Edit User Project'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Account ID Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Account ID</label>
                <input 
                  type="text" 
                  value={formData.eid} 
                  onChange={(e) => setFormData({...formData, eid: e.target.value})}
                  disabled={modalMode === 'edit'}
                  className="w-full px-4 py-2 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Please input Account ID"
                />
              </div>

              {/* Multiple Project Selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex justify-between">
                  <span>Project List</span>
                  <span className="text-xs text-blue-500 font-normal">{selectedProjectNos.size} selected</span>
                </label>
                
                <div className="border border-slate-200 text-slate-900 rounded-lg p-2 bg-slate-50 max-h-64 overflow-y-auto space-y-1">
                  {availableProjects.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">No projects available</div>
                  ) : (
                    availableProjects.map(proj => (
                      <label 
                        key={proj.tid} 
                        className="flex items-center gap-2 p-2 hover:bg-slate-200/50 rounded cursor-pointer transition-colors"
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedProjectNos.has(proj.projectNo)}
                          onChange={(e) => handleToggleProject(proj.projectNo, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-slate-700 select-none">
                          {proj.projectNo}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                Close
              </button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}