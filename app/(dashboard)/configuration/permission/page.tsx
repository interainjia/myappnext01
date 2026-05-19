"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, Save, X, Loader2 } from 'lucide-react';

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

  // 2. 获取数据并处理格式
  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/Menu/all-actions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
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

  useEffect(() => { fetchMenus(); }, []);

  // 3. 删除逻辑
  const handleDelete = async (id: number) => {
    if (!confirm("Confirm to disable this menu?")) return;
    try {
      const res = await fetch(`/api/Menu/${id}`, { 
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
          <h2 className="text-2xl font-bold text-slate-800">Permission Management</h2>
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
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Permission Structure</th>
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
      
      {/* 弹窗部分省略，可参考上一次回复中的 Form 结构 */}
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
  const children = node.childMenuList || node.children || [];
  const hasChildren = children.length > 0;

  return (
    <>
      <tr className="hover:bg-slate-50/80 group border-b border-slate-50">
        {/* 树形名称 */}
        <td className="px-6 py-4">
          <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
            {hasChildren ? (
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 mr-1 text-slate-400">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
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
