"use client";

import { useState } from 'react';
import GlassModal, { ModalCancelButton, ModalConfirmButton } from '@/components/ui/GlassModal';
import { useModal } from '@/lib/useModal';
import { Trash2, Info, Settings, AlertTriangle } from 'lucide-react';

export default function ModalDemoPage() {
  const basic   = useModal();
  const confirm = useModal();
  const form    = useModal();
  const large   = useModal();
  const [name, setName] = useState('');

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">GlassModal Demo</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">毛玻璃弹出框 · Framer Motion 弹簧动画</p>
      </div>

      {/* ── Trigger buttons ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DemoButton icon={<Info size={16} />} label="Info Modal" onClick={basic.onOpen} />
        <DemoButton icon={<Trash2 size={16} />} label="Confirm Delete" onClick={confirm.onOpen} color="red" />
        <DemoButton icon={<Settings size={16} />} label="Form Modal" onClick={form.onOpen} />
        <DemoButton icon={<AlertTriangle size={16} />} label="Large Modal" onClick={large.onOpen} />
      </div>

      {/* ── Basic info modal ─────────────────────────────────────────────── */}
      <GlassModal
        open={basic.open}
        onClose={basic.onClose}
        title="System Notification"
        footer={<ModalConfirmButton onClick={basic.onClose}>Got it</ModalConfirmButton>}
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
            <Info size={18} className="text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">Data export completed</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Your report has been generated and is ready for download.
              The file will be available for 7 days.
            </p>
          </div>
        </div>
      </GlassModal>

      {/* ── Confirm delete modal ─────────────────────────────────────────── */}
      <GlassModal
        open={confirm.open}
        onClose={confirm.onClose}
        title="Delete Project"
        footer={
          <>
            <ModalCancelButton onClick={confirm.onClose} />
            <ModalConfirmButton variant="danger" onClick={confirm.onClose}>
              Delete
            </ModalConfirmButton>
          </>
        }
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
            <Trash2 size={18} className="text-red-500 dark:text-red-400" />
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">Are you sure?</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              This action cannot be undone. All data associated with{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">Project Alpha</span>{' '}
              will be permanently deleted.
            </p>
          </div>
        </div>
      </GlassModal>

      {/* ── Form modal ───────────────────────────────────────────────────── */}
      <GlassModal
        open={form.open}
        onClose={form.onClose}
        title="Edit Profile"
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={form.onClose} />
            <ModalConfirmButton onClick={form.onClose}>Save Changes</ModalConfirmButton>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Display Name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="
                mt-1.5 block w-full px-3 py-2 text-sm rounded-lg
                bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600
                focus:outline-none focus:ring-2 focus:ring-[#4db694]/40 focus:border-[#4db694]
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                transition-shadow
              "
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Department</span>
            <select className="
              mt-1.5 block w-full px-3 py-2 text-sm rounded-lg
              bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600
              focus:outline-none focus:ring-2 focus:ring-[#4db694]/40 focus:border-[#4db694]
              transition-shadow
            ">
              <option>Research</option>
              <option>Development</option>
              <option>Operations</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Bio</span>
            <textarea
              rows={3}
              placeholder="Short introduction..."
              className="
                mt-1.5 block w-full px-3 py-2 text-sm rounded-lg resize-none
                bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600
                focus:outline-none focus:ring-2 focus:ring-[#4db694]/40 focus:border-[#4db694]
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                transition-shadow
              "
            />
          </label>
        </div>
      </GlassModal>

      {/* ── Large / scrollable modal ─────────────────────────────────────── */}
      <GlassModal
        open={large.open}
        onClose={large.onClose}
        title="Terms of Service"
        size="lg"
        footer={
          <>
            <ModalCancelButton onClick={large.onClose}>Decline</ModalCancelButton>
            <ModalConfirmButton onClick={large.onClose}>Accept</ModalConfirmButton>
          </>
        }
      >
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}>
              <p className="font-medium text-slate-700 dark:text-slate-300">Section {i + 1}</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          ))}
        </div>
      </GlassModal>
    </div>
  );
}

function DemoButton({
  icon, label, onClick, color = 'green',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: 'green' | 'red';
}) {
  const cls = color === 'red'
    ? 'border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 dark:hover:border-red-700'
    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600';
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 py-5 px-3 rounded-xl
        border bg-white dark:bg-slate-900 text-sm font-medium
        active:scale-[0.97] transition-all duration-150 ${cls}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
