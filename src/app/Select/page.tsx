'use client';
import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Heart,
  MessageSquare,
  Bot,
  Users,
  CalendarClock,
  Loader2,
} from 'lucide-react';

// 型定義
type Option = {
  id: string;
  department: string;
  label: string;
  description: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string; // Tailwind の from-*/to-* 用
};

const OPTIONS: Option[] = [
  {
    id: 'all-ai',
    department: '全部署',
    label: 'AI Chat',
    description: 'グループ共通のAIアシスタント',
    href: '/AIchat',
    Icon: Bot,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'nurse-shift',
    department: '看護部',
    label: 'シフト',
    description: '看護師のシフト作成・調整',
    href: '/schedule/ns',
    Icon: Heart,
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'rehab-plan',
    department: 'リハビリテーション部',
    label: '予定表',
    description: 'リハスタッフの予定・担当管理',
    href: '/schedule/riha',
    Icon: Activity,
    gradient: 'from-cyan-500 to-sky-600',
  },
  {
    id: 'all-corporate',
    department: '全部署',
    label: '意見交流',
    description: '社内の意見交換・アイデア共有',
    href: '/corporate',
    Icon: MessageSquare,
    gradient: 'from-violet-500 to-indigo-600',
  },
];

export default function DepartmentSelection() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedLabel = useMemo(
    () => OPTIONS.find((o) => o.id === selectedId)?.label ?? null,
    [selectedId]
  );

  const handleNavigate = (opt: Option) => {
    if (isPending) return; // 二重押下防止
    setSelectedId(opt.id);
    startTransition(() => {
      router.push(opt.href);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-black text-white">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        {/* ヘッダー */}
        <header className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/10 shadow backdrop-blur">
            <CalendarClock aria-hidden className="w-8 h-8" />
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">項目を選択</h1>
          <p className="mt-2 text-sm sm:text-base text-white/70">
            行きたい機能を選ぶとすぐに移動します。
          </p>
        </header>

        {/* ステータス（読み上げ用） */}
        <p className="sr-only" role="status" aria-live="polite">
          {isPending && selectedLabel ? `${selectedLabel} に移動中…` : '項目を選択してください'}
        </p>

        {/* オプショングリッド */}
        <section
          aria-label="利用できる項目"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          {OPTIONS.map((opt) => {
            const active = selectedId === opt.id && isPending;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleNavigate(opt)}
                disabled={isPending}
                className={[
                  'group relative w-full overflow-hidden rounded-2xl border text-left',
                  'border-white/10 bg-white/5 backdrop-blur-sm transition-all',
                  'hover:-translate-y-[2px] hover:shadow-xl hover:bg-white/10',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
                  'disabled:opacity-70 disabled:cursor-not-allowed',
                  'p-5 sm:p-6',
                ].join(' ')}
                aria-busy={active || undefined}
                aria-describedby={`${opt.id}-desc`}
              >
                {/* アクセントグラデーション */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity bg-gradient-to-r ${opt.gradient}`}
                />
                {/* フロストレイヤー */}
                <div className="relative z-10 flex items-start gap-4">
                  <div className="shrink-0 rounded-xl bg-black/30 border border-white/10 p-3">
                    <opt.Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-black/40 px-2 py-0.5 text-xs border border-white/10">
                        {opt.department}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold leading-tight">
                      {opt.label}
                    </h3>
                    <p id={`${opt.id}-desc`} className="mt-1 text-sm text-white/80 line-clamp-2">
                      {opt.description}
                    </p>

                    {/* ボタン行 */}
                    <div className="mt-4 flex items-center gap-3">
                      <span
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm font-medium transition-all group-hover:translate-x-0.5"
                        aria-hidden
                      >
                        {active ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                        {active ? '移動中…' : '開く'}
                      </span>
                      <span className="text-xs text-white/70" aria-hidden>
                        Enter / Space で決定
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* フッター */}
        <footer className="mt-10 sm:mt-14 text-center text-xs text-white/60">
          © 2025 Koreha Maenaka ga tukutta. www.
        </footer>
      </main>

      {/* ユーザーの reduce-motion 設定に追従 */}
      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          .hover\\:-translate-y-[2px]:hover {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
}
