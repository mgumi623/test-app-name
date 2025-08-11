'use client';
import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { OPTIONS } from './data';
import { Option } from './types';
import Header from './components/Header';
import OptionCard from './components/OptionCard';
import HospitalNews from './components/HospitalNews';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from '@/components/ui/carousel';
import { useEffect } from 'react';

export default function DepartmentSelection() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [currentViewOption, setCurrentViewOption] = useState<Option | null>(OPTIONS[0]);

  const selectedLabel = useMemo(
    () => OPTIONS.find((o) => o.id === selectedId)?.label ?? null,
    [selectedId]
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      const newIndex = api.selectedScrollSnap();
      setCurrent(newIndex + 1);
      // カルーセルの選択と表示を同期
      setCurrentViewOption(OPTIONS[Math.min(newIndex, OPTIONS.length - 1)]);
    });
  }, [api]);

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

        <section aria-label="利用できる項目" className="relative">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {OPTIONS.map((opt) => {
                const active = selectedId === opt.id && isPending;
                return (
                  <CarouselItem key={opt.id} className="pl-2 md:pl-4 md:basis-1/2">
                    <div className="p-1">
                      <OptionCard
                        option={opt}
                        isActive={active}
                        isPending={isPending}
                        onNavigate={handleNavigate}
                      />
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>

          {/* 中央表示ページ名 */}
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border border-border rounded-2xl shadow-sm">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${currentViewOption?.gradient} flex items-center justify-center`}>
                {currentViewOption && <currentViewOption.Icon className="w-4 h-4 text-white" />}
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">
                  {currentViewOption?.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {currentViewOption?.department}
                </p>
              </div>
            </div>
          </div>

          {/* ドットインジケーター */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: count }, (_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index + 1 === current 
                    ? "bg-primary w-8" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                onClick={() => api?.scrollTo(index)}
                aria-label={`${index + 1}番目の項目を表示`}
              />
            ))}
          </div>

          {/* モバイル用の指示テキスト */}
          <div className="md:hidden mt-4 text-center text-sm text-muted-foreground">
            スワイプして他の項目を見る
          </div>
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
