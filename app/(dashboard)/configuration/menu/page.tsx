"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { toastSuccess, toastError, toastWarning } from '@/lib/toast';
import GlassModal, { ModalCancelButton, ModalConfirmButton } from '@/components/ui/GlassModal';

// 1. Get the base URL from your .env.development
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// 2. 类型定义
interface MenuNode {
  tid: number;
  parentTid: number;
  name: string;
  url: string;
  orderRule: number;
  isActive: boolean;
  childMenuList?: MenuNode[]; // 对应后端字段名
}

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<MenuNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Partial<MenuNode> | null>(null);
  const [saving, setSaving] = useState(false);

  // 3. 获取数据并处理格式
  const fetchMenus = async () => {
    setLoading(true);
    try {
      // ✅ FIX: Using absolute URL
      const res = await fetch(`${API_BASE}/api/Menu/parents`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const result = await res.json();
      
      let data: MenuNode[] = [];
      if (result.status === "Ok" || result.status === "OK" || result.success === true) {
        data = Array.isArray(result.data) ? result.data : [];
      } else if (Array.isArray(result)) {
        data = result;
      } else if (Array.isArray(result.data)) {
        data = result.data;
      } else {
        console.warn("Unexpected API response format:", result);
      }
      setMenus(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMenu(null);
  };

  const handleSave = async () => {
    if (!editingMenu?.name?.trim()) {
      toastWarning("Menu name is required!");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/Menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          tid: editingMenu.tid || 0,
          parentTid: editingMenu.parentTid ?? 0,
          name: editingMenu.name.trim(),
          url: editingMenu.url || '',
          orderRule: editingMenu.orderRule || 0,
          isActive: editingMenu.isActive ?? true,
        }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      handleCloseModal();
      toastSuccess("Menu saved successfully!");
      fetchMenus();
    } catch (error) {
      console.error("Save error:", error);
      toastError("Failed to save menu.");
    } finally {
      setSaving(false);
    }
  };

  // 4. 删除逻辑
  const handleDelete = async (id: number) => {
    if (!confirm("Confirm to disable this menu?")) return;
    try {
      // ✅ FIX: Using absolute URL
      const res = await fetch(`${API_BASE}/api/Menu/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchMenus();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 顶部操作 */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Menu Management</h2>
          <p className="text-slate-500">Configure hierarchical navigation and system actions.</p>
        </div>
        <button 
          onClick={() => { setEditingMenu({ parentTid: 0, isActive: true }); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-[#4db694] text-white px-4 py-2 rounded-lg hover:bg-[#3d9a7d] transition-all"
        >
          <Plus size={18} /> Add Root
        </button>
      </div>

      {/* 列表渲染 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Menu Structure</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Path</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Sort</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-20"><Loader2 className="mx-auto animate-spin text-slate-300" /></td></tr>
            ) : (
              menus.map(menu => (
                <MenuRow key={menu.tid} node={menu} level={0} onEdit={(m) => { setEditingMenu(m); setIsModalOpen(true); }} onDelete={handleDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* === Modal: Add / Edit Menu === */}
      <GlassModal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingMenu?.tid ? 'Edit Menu' : 'Add Menu'}
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={handleCloseModal}>Close</ModalCancelButton>
            <ModalConfirmButton onClick={handleSave} loading={saving}>Save</ModalConfirmButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editingMenu?.name || ''}
              onChange={(e) => setEditingMenu(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter menu name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Path (URL)</label>
            <input
              type="text"
              value={editingMenu?.url || ''}
              onChange={(e) => setEditingMenu(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 text-slate-900 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
              placeholder="/path/to/page"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={editingMenu?.orderRule ?? 0}
                onChange={(e) => setEditingMenu(prev => ({ ...prev, orderRule: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                min={0}
              />
            </div>
            <div className="flex items-end pb-2 gap-2">
              <input
                type="checkbox"
                id="menu-isActive"
                checked={editingMenu?.isActive ?? true}
                onChange={(e) => setEditingMenu(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="menu-isActive" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">Active</label>
            </div>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

// 5. 递归行组件
function MenuRow({ node, level, onEdit, onDelete }: { 
  node: MenuNode; 
  level: number; 
  onEdit: (n: MenuNode) => void; 
  onDelete: (id: number) => void;
}) {
  // 如果后端初始返回了 children，则默认使用；否则初始化为空数组
  const initialChildren = node.childMenuList || (node as any).children || [];
  
  const [isExpanded, setIsExpanded] = useState(level === 0 && initialChildren.length > 0); // 默认展开已有子节点的父菜单
  const [localChildren, setLocalChildren] = useState<MenuNode[]>(initialChildren);
  const [isLoading, setIsLoading] = useState(false);

  // 处理展开/收起逻辑
  const handleToggleExpand = async () => {
    // 如果是收起操作，直接收起
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    // 如果准备展开，且本地已经有数据了，直接展开
    if (localChildren.length > 0) {
      setIsExpanded(true);
      return;
    }

    // 如果准备展开，但没有数据，则发起 API 请求动态获取子菜单
    setIsLoading(true);
    try {
      // ✅ FIX: Using absolute URL
      const res = await fetch(`${API_BASE}/api/Menu/sub/${node.tid}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const result = await res.json();
      
      // 兼容后端不同返回格式
      let fetchedChildren = [];
      if (result.status === "Ok" || result.status === "OK" || result.success === true) {
        fetchedChildren = result.data || [];
      } else if (Array.isArray(result)) {
        fetchedChildren = result;
      } else if (Array.isArray(result.data)) {
        fetchedChildren = result.data;
      }
      
      setLocalChildren(fetchedChildren);
      setIsExpanded(true);
    } catch (error) {
      console.error("Fetch sub-menus error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChildrenDisplay = localChildren.length > 0 || level === 0; // 假设顶级菜单都可以尝试展开

  return (
    <>
      <tr className="hover:bg-slate-50/80 group border-b border-slate-50">
        {/* 左侧：菜单结构名称 */}
        <td className="px-6 py-4">
          <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
            {hasChildrenDisplay ? (
              <button 
                onClick={handleToggleExpand} 
                disabled={isLoading}
                className="p-1 mr-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
              </button>
            ) : <span className="w-6" />}
            <span className={`text-sm ${level === 0 ? 'font-bold text-slate-700' : 'text-slate-600'}`}>
              {node.name}
            </span>
          </div>
        </td>
        
        {/* 路径 */}
        <td className="px-6 py-4 text-xs font-mono text-slate-400">{node.url}</td>
        
        {/* 排序 */}
        <td className="px-6 py-4 text-center text-sm text-slate-500">{node.orderRule}</td>
        
        {/* 右侧：操作按钮 */}
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end items-center gap-2">
            
            {level === 0 && (
              <button 
                onClick={handleToggleExpand}
                disabled={isLoading}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  isExpanded 
                    ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            )}

            <button onClick={() => onEdit(node)} className="p-1.5 text-white bg-blue-400 hover:bg-blue-500 rounded shadow-sm transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(node.tid)} className="p-1.5 text-white bg-red-400 hover:bg-red-500 rounded shadow-sm transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      
      {/* 递归渲染子节点 */}
      {isExpanded && localChildren.map((child, index) => (
        <MenuRow 
          key={`${child.tid}-${index}`} 
          node={child} 
          level={level + 1} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </>
  );
}