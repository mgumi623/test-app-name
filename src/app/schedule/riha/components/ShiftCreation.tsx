'use client';

import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Building2 } from 'lucide-react';
import StaffListSimple from './StaffListSimple';
import TeamView from './TeamView';
import { useTeams } from '../contexts/TeamsContext';

export default function ShiftCreation() {
  // 次月の日付を計算
  const nextMonth = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 1);
  }, []);
  const { teams, reorderTeams } = useTeams();

  const handleDragEnd = async (result: { destination?: { index: number } | null, source: { index: number }, draggableId: string }) => {
    if (!result.destination) return;

    try {
      const newTeamOrder = Array.from(teams);
      const [reorderedItem] = newTeamOrder.splice(result.source.index, 1);
      newTeamOrder.splice(result.destination.index, 0, reorderedItem);

      const newTeamIds = newTeamOrder.map(team => team.id);
      await reorderTeams(newTeamIds);
    } catch (error) {
      console.error('チームの順序の更新に失敗しました:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">シフト作成</h2>
        <p className="text-sm text-gray-600 mb-6">
          チーム別のシフトを作成します。
        </p>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="teams">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {teams.map((team, index) => (
                <Draggable key={team.id} draggableId={team.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Card className="shadow-sm border-gray-200 group">
                        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value={team.id} className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-green-50/30 data-[state=open]:bg-green-50/50 relative">
                <div
                  {...provided.dragHandleProps}
                  className="absolute left-0 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-3 ml-6">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">{team.name}チーム</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border p-4">
                    <TeamView teamName={team.name} currentDate={nextMonth} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
                        </Accordion>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}