import { useState, useEffect } from 'react';
import { Option } from '../types';
import OptionCard from './OptionCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from '@/components/ui/carousel';

interface AccordionLayoutProps {
  options: Option[];
  selectedId: string | null;
  isPending: boolean;
  onNavigate: (option: Option) => void;
}

export default function AccordionLayout({ options, selectedId, isPending, onNavigate }: AccordionLayoutProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const groupedOptions = options.reduce((acc, option) => {
    const department = option.department;
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(option);
    return acc;
  }, {} as Record<string, Option[]>);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      const newIndex = api.selectedScrollSnap();
      setCurrent(newIndex + 1);
    });
  }, [api, options]);

  return (
    <Accordion type="multiple" defaultValue={["すべて"]} className="w-full space-y-4">
      <AccordionItem key="すべて" value="すべて" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3">
            <div className="text-left">
              <h3 className="text-lg font-semibold">すべて</h3>
              <p className="text-sm text-muted-foreground">
                {options.length}個のサービス
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {options.map((option) => {
                const active = selectedId === option.id && isPending;
                return (
                  <CarouselItem key={option.id} className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/4">
                    <div className="p-1">
                      <OptionCard
                        option={option}
                        isActive={active}
                        isPending={isPending}
                        onNavigate={onNavigate}
                        className="min-h-[120px]"
                      />
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
          
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: count }, (_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index + 1 === current 
                    ? "bg-primary w-6" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                onClick={() => api?.scrollTo(index)}
                aria-label={`${index + 1}番目の項目を表示`}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      
      {Object.entries(groupedOptions).map(([department, departmentOptions]) => (
        <AccordionItem key={department} value={department} className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="text-left">
                <h3 className="text-lg font-semibold">{department}</h3>
                <p className="text-sm text-muted-foreground">
                  {departmentOptions.length}個のサービス
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departmentOptions.map((option) => {
                const active = selectedId === option.id && isPending;
                return (
                  <div key={option.id} className="w-full">
                    <OptionCard
                      option={option}
                      isActive={active}
                      isPending={isPending}
                      onNavigate={onNavigate}
                    />
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}