"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toastSuccess, toastError, toastWarning } from '@/lib/toast';
import GlassModal, { ModalCancelButton, ModalConfirmButton } from '@/components/ui/GlassModal';

// ✅ 2. 引入环境变量指向真实后端 API 地址
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// 1. 类型定义
interface MenuNode {
  tid: number;
  parentTid: number;
  name: string;
  url: string;
  orderRule: number;
  isActive: boolean;
  childMenuList?: MenuNode[]; // 对应后端字段名
}

export default function PermissionManagementPage() {
  const [menus, setMenus] = useState<MenuNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Partial<MenuNode> | null>(null);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  // 2. 获取数据并处理格式
  const fetchMenus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // ✅ 4. 使用 API_BASE 拼接绝对路径
      const res = await fetch(`${API_BASE}/api/Menu/all-actions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // ✅ 5. 处理 401 未授权 (Token 失效或缺失)
      if (res.status === 401) {
        console.warn("Unauthorized. Token is missing or expired. Redirecting to login...");
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const result = await res.json();
      // 兼容多种返回格式: {status: "Ok", data: []} 或 {success: true, data: []} 或 直接返回数组
      if (result.status === "Ok" || result.status === "OK" || result.success === true) {
        setMenus(result.data || []);
      } else if (Array.isArray(result)) {
        setMenus(result);
      } else if (Array.isArray(result.data)) {
        setMenus(result.data);
      } else {
        console.warn("Unexpected API response format:", result);
      }
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
      toastWarning("Permission name is required!");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/Menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      handleCloseModal();
      toastSuccess("Permission saved successfully!");
      fetchMenus();
    } catch (error) {
      console.error("Save error:", error);
      toastError("Failed to save permission.");
    } finally {
      setSaving(false);
    }
  };

  // 3. 删除逻辑
  const handleDelete = async (id: number) => {
    if (!confirm("Confirm to disable this menu?")) return;
    try {
      const token = localStorage.getItem('token');
      
      // ✅ 6. 删除接口同样补全 API_BASE 并处理 401
      const res = await fetch(`${API_BASE}/api/Menu/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (res.ok) fetchMenus();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 顶部操作 */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Permission Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Configure hierarchical navigation and system actions.</p>
        </div>
        <button 
          onClick={() => { setEditingMenu({ parentTid: 0, isActive: true }); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-[#4db694] text-white px-4 py-2 rounded-lg hover:bg-[#3d9a7d] transition-all"
        >
          <Plus size={18} /> Add Root
        </button>
      </div>

      {/* 列表渲染 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Permission Structure</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Path</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-center">Sort</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
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
      
      {/* === Modal: Add / Edit Permission === */}
      <GlassModal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingMenu?.tid ? 'Edit Permission' : 'Add Permission'}
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
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Name <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              value={editingMenu?.name || ''}
              onChange={(e) => setEditingMenu(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 dark:bg-slate-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter permission name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Path (URL)</label>
            <input
              type="text"
              value={editingMenu?.url || ''}
              onChange={(e) => setEditingMenu(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 dark:bg-slate-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
              placeholder="/api/resource or /path/to/page"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Sort Order</label>
              <input
                type="number"
                value={editingMenu?.orderRule ?? 0}
                onChange={(e) => setEditingMenu(prev => ({ ...prev, orderRule: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 dark:bg-slate-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                min={0}
              />
            </div>
            <div className="flex items-end pb-2 gap-2">
              <input
                type="checkbox"
                id="perm-isActive"
                checked={editingMenu?.isActive ?? true}
                onChange={(e) => setEditingMenu(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="perm-isActive" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">Active</label>
            </div>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

// 4. 递归行组件
function MenuRow({ node, level, onEdit, onDelete }: { 
  node: MenuNode; 
  level: number; 
  onEdit: (n: MenuNode) => void; 
  onDelete: (id: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  // @ts-ignore - 兼容后端不同的字段名
  const children: MenuNode[] = node.childMenuList || (node as any).children || [];
  const hasChildren = children.length > 0;

  return (
    <>
      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 group border-b border-slate-50 dark:border-slate-800">
        {/* 树形名称 */}
        <td className="px-6 py-4">
          <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
            {hasChildren ? (
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 mr-1 text-slate-400 dark:text-slate-500">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : <span className="w-6" />}
            <span className={`text-sm ${level === 0 ? 'font-bold text-slate-700 dark:text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
              {node.name}
            </span>
          </div>
        </td>
        
        {/* 路径 */}
        <td className="px-6 py-4 text-xs font-mono text-slate-400 dark:text-slate-500">{node.url}</td>
        
        {/* 排序 */}
        <td className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">{node.orderRule}</td>
        
        {/* === 修改的部分：操作按钮 === */}
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end items-center gap-2">
            <button 
              onClick={() => onEdit(node)} 
              className="p-1.5 text-white bg-blue-400 hover:bg-blue-500 rounded shadow-sm transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button 
              onClick={() => onDelete(node.tid)} 
              className="p-1.5 text-white bg-red-400 hover:bg-red-500 rounded shadow-sm transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      
      {/* 递归子节点 */}
      {isExpanded && hasChildren && children.map((child, index) => (
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