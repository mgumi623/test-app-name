'use client';
import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { OPTIONS } from './data';
import { Option } from './types';
import Header from './components/Header';
import HospitalNews from './components/HospitalNews';
import LayoutSwitcher, { LayoutType } from './components/LayoutSwitcher';
import GridLayout from './components/GridLayout';
import AccordionLayout from './components/AccordionLayout';
import ListLayout from './components/ListLayout';
import { useEffect } from 'react';

export default function DepartmentSelection() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('accordion');

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
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-muted/30 text-foreground">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <Header />

          <p className="sr-only" role="status" aria-live="polite">
            {isPending && selectedLabel ? `${selectedLabel} に移動中…` : '項目を選択してください'}
          </p>

          <LayoutSwitcher 
            currentLayout={currentLayout} 
            onLayoutChange={setCurrentLayout} 
          />

          <section aria-label="利用できる項目" className="relative">
          {currentLayout === 'grid' && (
            <GridLayout
              options={OPTIONS}
              selectedId={selectedId}
              isPending={isPending}
              onNavigate={handleNavigate}
            />
          )}
          
          {currentLayout === 'accordion' && (
            <AccordionLayout
              options={OPTIONS}
              selectedId={selectedId}
              isPending={isPending}
              onNavigate={handleNavigate}
            />
          )}
          
          {currentLayout === 'list' && (
            <ListLayout
              options={OPTIONS}
              selectedId={selectedId}
              isPending={isPending}
              onNavigate={handleNavigate}
            />
          )}
        </section>

          {/* 病院ニュース */}
          <HospitalNews />

          {/* フッター */}
        <footer className="mt-10 sm:mt-14 text-center text-xs text-muted-foreground">
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
