"use client";

import { CHANGELOG, ChangeType } from '@/constants/changelog';

const TYPE_STYLE: Record<ChangeType, { label: string; className: string }> = {
  feat:     { label: 'Feature',  className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  fix:      { label: 'Fix',      className: 'bg-amber-50  text-amber-700  ring-1 ring-amber-200'  },
  security: { label: 'Security', className: 'bg-red-50    text-red-700    ring-1 ring-red-200'    },
  chore:    { label: 'Chore',    className: 'bg-slate-100 text-slate-600  ring-1 ring-slate-200'  },
  docs:     { label: 'Docs',     className: 'bg-blue-50   text-blue-700   ring-1 ring-blue-200'   },
};

export default function ChangelogPage() {
  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-800">Release Notes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Full history of changes across all versions of this application.
        </p>
      </div>

      <div className="relative">
        {/* 竖向时间轴线 */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200" />

        <ol className="space-y-10">
          {CHANGELOG.map((release, idx) => (
            <li key={release.version} className="relative pl-8">
              {/* 时间轴圆点 */}
              <div className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-white ring-2 ${
                idx === 0 ? 'bg-[#4db694] ring-[#4db694]' : 'bg-slate-300 ring-slate-300'
              }`} />

              {/* 版本头部 */}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                  idx === 0
                    ? 'bg-[#4db694] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  v{release.version}
                </span>
                <span className="text-xs text-slate-400">{release.date}</span>
                {release.highlight && (
                  <span className="text-sm text-slate-500 italic">— {release.highlight}</span>
                )}
              </div>

              {/* 变更列表 */}
              <ul className="space-y-2">
                {release.changes.map((change, i) => {
                  const style = TYPE_STYLE[change.type];
                  return (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.className}`}>
                        {style.label}
                      </span>
                      <span className="text-slate-600 leading-snug">
                        {change.scope && (
                          <span className="font-medium text-slate-800 mr-1">{change.scope}</span>
                        )}
                        {change.description}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
