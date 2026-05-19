"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Copy, Trash2, Search, RefreshCw, X, Check, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';

// === 1. Type Definitions ===
interface Role {
  tid: number;
  roleName: string;
  description: string;
  createUser: string;
}

interface PermissionNode {
  tid: number | string; // MenuId or ActionId
  name: string;
  isAction?: boolean; // Differentiate between menu and button/action
  children?: PermissionNode[];
}

export default function RoleManagementPage() {
  // === State Management ===
  // List state
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  
  // Search parameters
  const [searchName, setSearchName] = useState("");
  const [searchCreator, setSearchCreator] = useState("");

  // Modal and form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'copy'>('add');
  const [formData, setFormData] = useState<Partial<Role>>({ roleName: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Permission tree state
  const [permissionTree, setPermissionTree] = useState<PermissionNode[]>([]);
  const [checkedNodeIds, setCheckedNodeIds] = useState<Set<number | string>>(new Set());
  const [treeLoading, setTreeLoading] = useState(false);

  // === 2. Data Fetching ===
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchName) query.append("roleName", searchName);
      if (searchCreator) query.append("createUser", searchCreator);
      
      const res = await fetch(`/api/Role?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error("Fetch roles failed");
      const result = await res.json();
      
      const data = result.data || result.rows || result || [];
      setRoles(Array.isArray(data) ? data : []);
      setSelectedRoleId(null); 
    } catch (error) {
      console.error(error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Fetch full permission tree
  const fetchPermissionTree = async () => {
    try {
      const res = await fetch('/api/Role/actions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await res.json();
      const treeData = result.data || result;
      setPermissionTree(Array.isArray(treeData) ? treeData : []);
    } catch (error) {
      console.error("Fetch tree error:", error);
      setPermissionTree([]);
    }
  };

  // Fetch selected permissions for a specific role
  const fetchRolePermissions = async (roleId: number | string) => {
    setTreeLoading(true);
    try {
      const res = await fetch(`/api/Role/role-actions?roleId=${roleId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await res.json();
      const selectedIds = result.data || result || [];
      setCheckedNodeIds(new Set(Array.isArray(selectedIds) ? selectedIds : []));
    } catch (error) {
      console.error("Fetch role actions error:", error);
      setCheckedNodeIds(new Set());
    } finally {
      setTreeLoading(false);
    }
  };

  // === 3. Button Actions ===
  const handleOpenModal = async (mode: 'add' | 'edit' | 'copy') => {
    if ((mode === 'edit' || mode === 'copy') && !selectedRoleId) {
      alert("Please select a role first!");
      return;
    }

    setModalMode(mode);
    setTreeLoading(true);
    setIsModalOpen(true);
    setCheckedNodeIds(new Set()); 

    // 1. Fetch tree structure
    await fetchPermissionTree();

    // 2. Prepare data
    if (mode === 'add') {
      setFormData({ roleName: '', description: '' });
      setTreeLoading(false);
    } else {
      // Use == for comparison to handle string/number differences from API
      const targetRole = roles.find(r => String(r.tid) === String(selectedRoleId));
      if (targetRole) {
        setFormData({
          tid: mode === 'edit' ? targetRole.tid : undefined,
          roleName: mode === 'copy' ? `${targetRole.roleName}_copy` : targetRole.roleName,
          description: targetRole.description || ''
        });
        await fetchRolePermissions(targetRole.tid);
      } else {
        setTreeLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedRoleId) {
      alert("Please select a role first!");
      return;
    }
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const res = await fetch(`/api/Role/${selectedRoleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchRoles();
      } else {
        alert("Delete failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!formData.roleName?.trim()) {
      alert("Role Name cannot be empty!");
      return;
    }

    setSaving(true);
    try {
      // 1. Save basic role info
      const roleRes = await fetch('/api/Role', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          tid: formData.tid,
          roleName: formData.roleName,
          description: formData.description
        })
      });
      
      if (!roleRes.ok) throw new Error("Save role failed");
      const roleResult = await roleRes.json();
      const newRoleId = formData.tid || roleResult.data?.tid || roleResult.tid; // Adjust based on API

      // 2. Save role permission mapping
      await fetch('/api/Role/actions-mapping', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          roleId: newRoleId,
          actionIds: Array.from(checkedNodeIds)
        })
      });

      setIsModalOpen(false);
      fetchRoles();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save role.");
    } finally {
      setSaving(false);
    }
  };

  // === 4. UI Rendering ===
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal('add')} className="flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
            <Plus size={16} /> Add Role
          </button>
          <button onClick={() => handleOpenModal('edit')} className="flex items-center gap-1.5 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium">
            <Pencil size={16} /> Edit Role
          </button>
          <button onClick={() => handleOpenModal('copy')} className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">
            <Copy size={16} /> Copy Role
          </button>
          <button onClick={handleDelete} className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
            <Trash2 size={16} /> Delete Role
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search Role Name" 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRoles()}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search Creator" 
              value={searchCreator}
              onChange={(e) => setSearchCreator(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRoles()}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <button onClick={fetchRoles} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Role Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 w-12 text-center"></th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Role ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Role Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Description</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Creator</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-slate-400" size={24} /></td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-slate-500">No data available</td></tr>
            ) : (
              roles.map(role => (
                <tr 
                  key={role.tid} 
                  onClick={() => setSelectedRoleId(role.tid)}
                  className={`border-b border-slate-50 cursor-pointer transition-colors ${selectedRoleId === role.tid ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="radio" 
                      name="roleSelection"
                      checked={selectedRoleId === role.tid} 
                      onChange={() => setSelectedRoleId(role.tid)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{role.tid}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{role.roleName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{role.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{role.createUser}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                {modalMode === 'add' ? 'Add Role' : modalMode === 'edit' ? 'Edit Role' : 'Copy Role'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Role Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.roleName} 
                  onChange={(e) => setFormData({...formData, roleName: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Enter unique role name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Enter role description"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-sm font-semibold text-slate-700">Select Menu and Action Permissions:</label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                  {treeLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" /></div>
                  ) : (
                    <div className="space-y-1">
                      {permissionTree.map(node => (
                        <TreeNode 
                          key={node.tid} 
                          node={node} 
                          checkedIds={checkedNodeIds}
                          onToggle={(id, isChecked) => {
                            const newSet = new Set(checkedNodeIds);
                            if (isChecked) newSet.add(id);
                            else newSet.delete(id);
                            setCheckedNodeIds(newSet);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// === 5. Recursive Tree Multi-select Component (Replacing zTree) ===
function TreeNode({ 
  node, 
  level = 0, 
  checkedIds, 
  onToggle 
}: { 
  node: PermissionNode, 
  level?: number, 
  checkedIds: Set<number | string>,
  onToggle: (id: number | string, checked: boolean) => void 
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isChecked = checkedIds.has(node.tid);

  return (
    <div className="select-none">
      <div className="flex items-center gap-1.5 py-1.5 hover:bg-slate-200/50 rounded px-1 transition-colors">
        {/* Expand/Collapse Icon Placeholder */}
        <div style={{ paddingLeft: `${level * 20}px` }} className="flex items-center">
          {hasChildren ? (
            <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-slate-500 hover:text-slate-800">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-[18px]"></span>
          )}
        </div>
        
        {/* Checkbox */}
        <input 
          type="checkbox" 
          checked={isChecked}
          onChange={(e) => onToggle(node.tid, e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer mt-0.5"
          id={`node-${node.tid}`}
        />
        
        {/* Label */}
        <label 
          htmlFor={`node-${node.tid}`} 
          className={`text-sm cursor-pointer ${node.isAction ? 'text-emerald-600' : 'text-slate-700'}`}
        >
          {node.name}
        </label>
      </div>
      
      {/* Render Child Nodes Recursively */}
      {expanded && hasChildren && (
        <div>
          {node.children!.map(child => (
            <TreeNode 
              key={child.tid} 
              node={child} 
              level={level + 1} 
              checkedIds={checkedIds} 
              onToggle={onToggle} 
            />
          ))}
        </div>
      )}
    </div>
  );
}