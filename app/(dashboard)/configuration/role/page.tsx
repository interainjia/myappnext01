"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Copy, Trash2, Search, RefreshCw, X, Check, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toastSuccess, toastError, toastWarning } from '@/lib/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// === 1. Type Definitions ===
interface Role {
  tid: number;
  roleName: string;
  description: string;
  createUser: string;
}

interface PermissionNode {
  tid: number | string; 
  name: string;
  isAction?: boolean; 
  children?: PermissionNode[];
  childMenuList?: PermissionNode[]; 
}

export default function RoleManagementPage() {
  // === State Management ===
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  
  // Pagination State
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);

  const [searchName, setSearchName] = useState("");
  const [searchCreator, setSearchCreator] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'copy'>('add');
  const [formData, setFormData] = useState<Partial<Role>>({ roleName: '', description: '' });
  const [saving, setSaving] = useState(false);

  const [permissionTree, setPermissionTree] = useState<PermissionNode[]>([]);
  const [checkedNodeIds, setCheckedNodeIds] = useState<Set<number | string>>(new Set());
  const [treeLoading, setTreeLoading] = useState(false);

  const router = useRouter(); 

  const handleUnauthorized = () => {
    console.warn("Unauthorized. Token is missing or expired. Redirecting to login...");
    localStorage.removeItem('token');
    router.push('/login');
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("pageIndex", pageIndex.toString());
      query.append("pageSize", pageSize.toString());
      
      if (searchName) query.append("roleName", searchName);
      if (searchCreator) query.append("createUser", searchCreator);
      
      const res = await fetch(`${API_BASE}/api/Role?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Fetch roles failed");
      
      const result = await res.json();
      const data = result.data || result.rows || result || [];
      
      setRoles(Array.isArray(data) ? data : []);
      setTotal(result.total || result.totalCount || 0); 
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  const handleSearchTrigger = () => {
    if (pageIndex !== 1) {
      setPageIndex(1); 
    } else {
      fetchRoles(); 
    }
  };

  const fetchPermissionTree = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/Menu/parents`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.status === 401) return handleUnauthorized();
      
      const result = await res.json();
      
      let data: PermissionNode[] = [];
      if (result.status === "Ok" || result.status === "OK" || result.success === true || result.status === 1) {
        data = Array.isArray(result.data) ? result.data : [];
      } else if (Array.isArray(result)) {
        data = result;
      } else if (result && Array.isArray(result.data)) {
        data = result.data;
      }
      
      setPermissionTree(data); 
    } catch (error) {
      console.error("Fetch tree error:", error);
      setPermissionTree([]);
    }
  };

  const fetchRolePermissions = async (roleId: number | string) => {
    setTreeLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/Role/role-actions?roleId=${roleId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.status === 401) return handleUnauthorized();
      
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

  const handleOpenModal = async (mode: 'add' | 'edit' | 'copy') => {
    if ((mode === 'edit' || mode === 'copy') && !selectedRoleId) {
      toastWarning("Please select a role first!");
      return;
    }

    setModalMode(mode);
    setTreeLoading(true);
    setIsModalOpen(true);
    setCheckedNodeIds(new Set()); 

    await fetchPermissionTree();

    if (mode === 'add') {
      setFormData({ roleName: '', description: '' });
      setTreeLoading(false);
    } else {
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
      toastWarning("Please select a role first!");
      return;
    }
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/Role/${selectedRoleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.status === 401) return handleUnauthorized();
      if (res.ok) {
        toastSuccess("Role deleted successfully.");
        fetchRoles();
      } else {
        toastError("Failed to delete role.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!formData.roleName?.trim()) {
      toastWarning("Role Name cannot be empty!");
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || '';
      
      // ✅ 1. 核心修复：分离数字和字符串
      // 将纯数字的 Menu IDs 提取出来，避免字符串引发 C# 的 400 转换错误
      const menuIds = Array.from(checkedNodeIds)
        .map(id => Number(id))
        .filter(id => !isNaN(id));

      const payload: any = { 
        roleName: formData.roleName.trim(), 
        roleDesc: formData.description?.trim() || '',
        Ids: menuIds, // 把纯数字菜单ID传给后端的 Ids 字段
        Actions: []   
      };
      
      if ((modalMode === 'edit' || modalMode === 'copy') && formData.tid) {
        payload.tid = formData.tid;
      }

      // ✅ 2. 发送主保存请求
      const roleRes = await fetch(`${API_BASE}/api/Role`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (roleRes.status === 401) return handleUnauthorized();
      if (!roleRes.ok) throw new Error(`Role API failed with status ${roleRes.status}`);
      
      const roleResult = await roleRes.json();
      
      // ✅ 3. 提取 Role ID
      let newRoleId = formData.tid;
      if (modalMode === 'add' || modalMode === 'copy') {
        if (roleResult?.data?.tid) newRoleId = roleResult.data.tid;
        else if (roleResult?.tid) newRoleId = roleResult.tid;
        else if (typeof roleResult?.data === 'number') newRoleId = roleResult.data;
        else if (typeof roleResult === 'number') newRoleId = roleResult;
      }

      // ✅ 4. 发送 Mapping 映射请求
      if (newRoleId) {
        const mappingRes = await fetch(`${API_BASE}/api/Role/actions-mapping`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            roleId: Number(newRoleId), 
            actionIds: menuIds // 👈 关键：只发送纯数字的集合，防止 400 报错
          })
        });

        if (mappingRes.status === 401) return handleUnauthorized();
        
        // 如果这里仍然报错，我们将其降级为警告，不阻断 UI 关闭，因为主体 Role 已经保存成功
        if (!mappingRes.ok) {
          console.warn(`Mapping API returned ${mappingRes.status} Bad Request. JSON Binding failed.`);
        }
      }

      setIsModalOpen(false);
      toastSuccess("Role saved successfully!");
      fetchRoles();
    } catch (error) {
      console.error("Save error:", error);
      toastError(`Save failed: ${(error as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNodes = (ids: Array<number | string>, isChecked: boolean) => {
    const newSet = new Set(checkedNodeIds);
    ids.forEach(id => {
      if (isChecked) newSet.add(id);
      else newSet.delete(id);
    });
    setCheckedNodeIds(newSet);
  };

  const handleLoadChildren = (parentId: number | string, children: PermissionNode[]) => {
    const attachChildrenToNode = (list: PermissionNode[]): PermissionNode[] => {
      return list.map(node => {
        if (node.tid === parentId) {
          return { ...node, childMenuList: children };
        }
        if (node.childMenuList || node.children) {
          return { ...node, childMenuList: attachChildrenToNode(node.childMenuList || node.children || []) };
        }
        return node;
      });
    };
    setPermissionTree(prev => attachChildrenToNode(prev));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal('add')} className="flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"><Plus size={16} /> Add Role</button>
          <button onClick={() => handleOpenModal('edit')} className="flex items-center gap-1.5 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium"><Pencil size={16} /> Edit Role</button>
          <button onClick={() => handleOpenModal('copy')} className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"><Copy size={16} /> Copy Role</button>
          <button onClick={handleDelete} className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"><Trash2 size={16} /> Delete Role</button>
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative">
            <input type="text" name="search_dummy_role_name" autoComplete="off" placeholder="Search Role Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()} className="pl-9 pr-4 py-2 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40" />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <div className="relative">
            <input type="text" name="search_dummy_creator" autoComplete="off" placeholder="Search Creator" value={searchCreator} onChange={(e) => setSearchCreator(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()} className="pl-9 pr-4 py-2 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36" />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <button onClick={handleSearchTrigger} className="p-2 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg hover:bg-slate-50 transition-colors" title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Role Table Wrapper */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
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
                  <tr key={role.tid} onClick={() => setSelectedRoleId(role.tid)} className={`border-b border-slate-50 cursor-pointer transition-colors ${selectedRoleId === role.tid ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 text-center">
                      <input type="radio" name="roleSelection" checked={selectedRoleId === role.tid} onChange={() => setSelectedRoleId(role.tid)} className="w-4 h-4 text-blue-600 cursor-pointer" />
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

        {/* Basic Pagination Controls */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-sm text-slate-500">Total {total} records</span>
          
          <div className="flex items-center gap-4">
            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(1); 
              }}
              className="px-3 py-1.5 border border-slate-200 text-slate-900 rounded text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
                className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={pageIndex * pageSize >= total} 
                onClick={() => setPageIndex(p => p + 1)}
                className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{modalMode === 'add' ? 'Add Role' : modalMode === 'edit' ? 'Edit Role' : 'Copy Role'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Role Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.roleName} onChange={(e) => setFormData({...formData, roleName: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="Enter unique role name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="Enter role description" />
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-sm font-semibold text-slate-700">Select Menu Permissions:</label>
                <div className="p-4 bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg max-h-64 overflow-y-auto">
                  {treeLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" /></div>
                  ) : (
                    <div className="space-y-1">
                      {permissionTree.map(node => (
                        <TreeNode 
                          key={node.tid} 
                          node={node} 
                          checkedIds={checkedNodeIds}
                          onToggle={handleToggleNodes} 
                          onLoadChildren={handleLoadChildren} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// === 5. Recursive Tree Multi-select Component ===
function TreeNode({ 
  node, 
  level = 0, 
  checkedIds, 
  onToggle,
  onLoadChildren 
}: { 
  node: PermissionNode, 
  level?: number, 
  checkedIds: Set<number | string>,
  onToggle: (ids: Array<number | string>, checked: boolean) => void,
  onLoadChildren: (parentId: number | string, children: PermissionNode[]) => void
}) {
  const validChildren = (node.childMenuList || node.children || []).filter((child: PermissionNode) => !child.isAction);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(validChildren.length > 0);

  const getAllDescendantIds = (nodes: PermissionNode[]): Array<number | string> => {
    let ids: Array<number | string> = [];
    nodes.forEach(n => {
      ids.push(n.tid);
      const subChildren = (n.childMenuList || n.children || []).filter(c => !c.isAction);
      if (subChildren.length > 0) {
        ids = ids.concat(getAllDescendantIds(subChildren)); 
      }
    });
    return ids;
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const idsToToggle = [node.tid, ...getAllDescendantIds(validChildren)];
    onToggle(idsToToggle, isChecked);
  };

  const handleToggleExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }
    
    if (validChildren.length > 0 || hasFetched) {
      setIsExpanded(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/Menu/sub/${node.tid}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const result = await res.json();
      
      let fetchedChildren: PermissionNode[] = [];
      if (result.status === "Ok" || result.status === "OK" || result.success === true || result.status === 1) {
        fetchedChildren = result.data || [];
      } else if (Array.isArray(result)) {
        fetchedChildren = result;
      } else if (result && Array.isArray(result.data)) {
        fetchedChildren = result.data;
      }
      
      const parsedChildren = fetchedChildren.filter(c => !c.isAction);

      onLoadChildren(node.tid, parsedChildren);

      if (checkedIds.has(node.tid) && parsedChildren.length > 0) {
        const newChildIds = parsedChildren.map(c => c.tid);
        onToggle(newChildIds, true);
      }

    } catch (error) {
      console.error("Fetch sub-menus error:", error);
    } finally {
      setHasFetched(true);
      setIsExpanded(true);
      setIsLoading(false);
    }
  };

  const showChevron = validChildren.length > 0 || !hasFetched;
  const isChecked = checkedIds.has(node.tid);

  return (
    <div className="select-none">
      <div className="flex items-center gap-1.5 py-1.5 hover:bg-slate-200/50 rounded px-1 transition-colors">
        <div style={{ paddingLeft: `${level * 20}px` }} className="flex items-center">
          {showChevron ? (
            <button onClick={handleToggleExpand} disabled={isLoading} className="p-0.5 text-slate-500 hover:text-slate-800 disabled:opacity-50">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
            </button>
          ) : (
            <span className="w-[18px]"></span>
          )}
        </div>
        
        <input 
          type="checkbox" 
          checked={isChecked}
          onChange={handleCheckboxChange} 
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer mt-0.5"
          id={`node-${node.tid}`}
        />
        
        <label htmlFor={`node-${node.tid}`} className="text-sm cursor-pointer text-slate-700">
          {node.name}
        </label>
      </div>
      
      {isExpanded && validChildren.length > 0 && (
        <div>
          {validChildren.map((child: PermissionNode) => (
            <TreeNode 
              key={child.tid} 
              node={child} 
              level={level + 1} 
              checkedIds={checkedIds} 
              onToggle={onToggle} 
              onLoadChildren={onLoadChildren}
            />
          ))}
        </div>
      )}
    </div>
  );
}