"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Shield, Ban, Search, RefreshCw, Check, Loader2, Edit2, Save, X } from 'lucide-react';
import GlassModal, { ModalCancelButton, ModalConfirmButton } from '@/components/ui/GlassModal';
import { useRouter } from 'next/navigation';
import { toastSuccess, toastError, toastWarning } from '@/lib/toast';

// ✅ 2. 引入环境变量指向真实后端 API 地址
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// === 1. Type Definitions ===
interface User {
  tid: number;
  eid: string;
  userName: string;
  phone: string;
  loginIp: string;
  lastLoginTime: string;
  roleTid: number;
  roleDesc: string;
  roleName: string;
  createUser: string;
  userAgent: string;
}

interface Role {
  tid: number;
  roleName: string;
}

export default function SystemUsersPage() {
  // === State Management ===
  // Table Data
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Pagination
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [searchEid, setSearchEid] = useState("");
  const [filterRoleId, setFilterRoleId] = useState<number>(0);
  
  // Roles Data (for Dropdowns)
  const [roles, setRoles] = useState<Role[]>([]);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Data
  const [addFormData, setAddFormData] = useState({ eid: '', userName: '', pwd: '', roleTid: '' });
  const [assignRoleTid, setAssignRoleTid] = useState<string>('');

  // Inline Editing State (for Phone)
  const [editingPhoneId, setEditingPhoneId] = useState<number | null>(null);
  const [editingPhoneValue, setEditingPhoneValue] = useState("");

  const router = useRouter(); // ✅ 3. 初始化 router

  // ✅ 统一的 401 处理函数
  const handleUnauthorized = () => {
    console.warn("Unauthorized. Token is missing or expired. Redirecting to login...");
    localStorage.removeItem('token');
    router.push('/login');
  };

  // === 2. Data Fetching ===
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/Role`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.status === 401) return handleUnauthorized();
      
      const result = await res.json();
      setRoles(result.data || result.rows || result || []);
    } catch (error) {
      console.error("Fetch roles failed:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/Account/search`, {
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
          RoleTid: filterRoleId === 0 ? undefined : filterRoleId
        })
      });
      
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Fetch users failed");
      
      const result = await res.json();
      
      setUsers(result.rows || result.data || []);
      setTotal(result.total || 0);
      setSelectedUserId(null); // Clear selection on refresh
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload data when pagination changes
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  // === 3. Button Actions ===
  const handleAddUser = async () => {
    if (!addFormData.eid || !addFormData.userName || !addFormData.pwd || !addFormData.roleTid) {
      toastWarning("Please fill in all required fields!");
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/Account`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          Eid: addFormData.eid,
          UserName: addFormData.userName,
          Pwd: addFormData.pwd,
          RoleTid: Number(addFormData.roleTid)
        })
      });
      
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Add user failed");

      setIsAddModalOpen(false);
      setAddFormData({ eid: '', userName: '', pwd: '', roleTid: '' });
      toastSuccess("User added successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Add user error:", error);
      toastError("Failed to add user.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAssignRoleModal = () => {
    if (!selectedUserId) {
      toastWarning("Please select a user first!");
      return;
    }
    const user = users.find(u => u.tid === selectedUserId);
    setAssignRoleTid(user?.roleTid ? String(user.roleTid) : '');
    setIsRoleModalOpen(true);
  };

  const handleAssignRole = async () => {
    if (!assignRoleTid) {
      toastWarning("Please select a role!");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/Account/roles`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          UserTid: selectedUserId,
          RoleTid: Number(assignRoleTid)
        })
      });
      
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Assign role failed");

      setIsRoleModalOpen(false);
      toastSuccess("Role assigned successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Assign role error:", error);
      toastError("Failed to assign role.");
    } finally {
      setSaving(false);
    }
  };

  const handleDisableUser = async () => {
    if (!selectedUserId) {
      toastWarning("Please select a user first!");
      return;
    }
    const targetUser = users.find(u => u.tid === selectedUserId);
    if (!confirm(`Are you sure you want to disable user [${targetUser?.userName}]?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/Account/${selectedUserId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.status === 401) return handleUnauthorized();
      
      if (res.ok) {
        toastSuccess(`User [${targetUser?.userName}] has been disabled.`);
        fetchUsers();
      } else {
        toastError("Failed to disable user.");
      }
    } catch (error) {
      console.error("Disable error:", error);
      toastError("Failed to disable user.");
    }
  };

  const handlePhoneEditSave = async (userId: number) => {
    if (!editingPhoneValue.trim()) {
      toastWarning("Please fill in the mobile number!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/Account/field`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          tid: userId,
          field: 'Phone',
          value: editingPhoneValue.trim()
        })
      });
      
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Update field failed");

      setEditingPhoneId(null);
      toastSuccess("Mobile number updated.");
      fetchUsers();
    } catch (error) {
      console.error("Update field error:", error);
      toastError("Failed to update mobile number.");
    }
  };

  // Helper for text truncation
  const truncateText = (text: string, length: number = 15) => {
    if (!text) return '-';
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  // === 4. UI Rendering ===
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
        
        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
            <Plus size={16} /> Add User
          </button>
          <button onClick={handleOpenAssignRoleModal} className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">
            <Shield size={16} /> Assign Role
          </button>
          <button onClick={handleDisableUser} className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
            <Ban size={16} /> Disable User
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <input 
              type="text"
              name="search_dummy_name"
              autoComplete="off"
              placeholder="User Name" 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:bg-slate-800 dark:placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Login Account" 
              value={searchEid}
              onChange={(e) => setSearchEid(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:bg-slate-800 dark:placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
          </div>
          <select 
            className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800"
            value={filterRoleId}
            onChange={(e) => { setFilterRoleId(Number(e.target.value)); }}
          >
            <option value={0}>Filter by Role (All)</option>
            {roles.map(r => (
              <option key={r.tid} value={r.tid}>{r.roleName}</option>
            ))}
          </select>
          <button onClick={fetchUsers} className="p-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 w-12 text-center"></th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Login Account</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Mobile</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Last Login IP</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Last Login Time</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Assigned Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Created By</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">UserAgent</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-slate-400 dark:text-slate-500" size={24} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="py-20 text-center text-slate-500 dark:text-slate-400">No data available</td></tr>
              ) : (
                users.map(user => (
                  <tr 
                    key={user.tid} 
                    onClick={() => setSelectedUserId(user.tid)}
                    className={`border-b border-slate-50 dark:border-slate-800 cursor-pointer transition-colors ${selectedUserId === user.tid ? 'bg-blue-50/50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="radio" 
                        name="userSelection"
                        checked={selectedUserId === user.tid} 
                        onChange={() => setSelectedUserId(user.tid)}
                        className="w-4 h-4 text-blue-600 dark:text-blue-400 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-100">{user.eid}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{user.userName}</td>
                    
                    {/* Editable Mobile Field */}
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300" onClick={(e) => e.stopPropagation()}>
                      {editingPhoneId === user.tid ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            className="w-32 px-2 py-1 text-sm border border-blue-400 dark:border-blue-500 rounded focus:outline-none dark:bg-slate-800 dark:text-slate-100"
                            value={editingPhoneValue}
                            onChange={(e) => setEditingPhoneValue(e.target.value)}
                            autoFocus
                          />
                          <button onClick={() => handlePhoneEditSave(user.tid)} className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"><Save size={14} /></button>
                          <button onClick={() => setEditingPhoneId(null)} className="p-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span>{user.phone || '-'}</span>
                          <button 
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-opacity"
                            onClick={() => { setEditingPhoneId(user.tid); setEditingPhoneValue(user.phone || ""); }}
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{user.loginIp || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{user.lastLoginTime || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300" title={user.roleDesc}>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500">
                        {user.roleName || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{user.createUser}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 dark:text-slate-500 font-mono text-xs" title={user.userAgent}>
                      {truncateText(user.userAgent, 20)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Basic Pagination Controls */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <span className="text-sm text-slate-500 dark:text-slate-400">Total {total} records</span>
          
          <div className="flex items-center gap-4">
            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(1); // Reset to first page when changing page size
              }}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded text-sm bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={75}>75 per page</option>
              <option value={100}>100 per page</option>
            </select>

            {/* Pagination Buttons */}
            <div className="flex gap-2">
              <button 
                disabled={pageIndex === 1} 
                onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded text-sm bg-white dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={pageIndex * pageSize >= total} 
                onClick={() => setPageIndex(p => p + 1)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded text-sm bg-white dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* === Modal: Add New User === */}
      <GlassModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={() => setIsAddModalOpen(false)}>Close</ModalCancelButton>
            <ModalConfirmButton onClick={handleAddUser} loading={saving}>Submit</ModalConfirmButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Login Name (English)</label>
            <input
              type="text" value={addFormData.eid} onChange={(e) => setAddFormData({...addFormData, eid: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:bg-slate-800 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter login name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input
              type="text" value={addFormData.userName} onChange={(e) => setAddFormData({...addFormData, userName: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:bg-slate-800 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter user name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input
              type="password" value={addFormData.pwd} onChange={(e) => setAddFormData({...addFormData, pwd: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:bg-slate-800 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <select
              value={addFormData.roleTid} onChange={(e) => setAddFormData({...addFormData, roleTid: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
            >
              <option value="">Select a role...</option>
              {roles.map(r => <option key={r.tid} value={r.tid}>{r.roleName}</option>)}
            </select>
          </div>
        </div>
      </GlassModal>

      {/* === Modal: Assign Role === */}
      <GlassModal
        open={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Assign Role"
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={() => setIsRoleModalOpen(false)}>Close</ModalCancelButton>
            <ModalConfirmButton onClick={handleAssignRole} loading={saving}>Submit</ModalConfirmButton>
          </>
        }
      >
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Role for User</label>
          <select
            value={assignRoleTid} onChange={(e) => setAssignRoleTid(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
          >
            <option value="">Please select...</option>
            {roles.map(r => <option key={r.tid} value={r.tid}>{r.roleName}</option>)}
          </select>
        </div>
      </GlassModal>

    </div>
  );
}