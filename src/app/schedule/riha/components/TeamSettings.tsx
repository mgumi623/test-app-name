'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, X, Plus, Settings2, Users } from 'lucide-react';
import { useTeams } from '../contexts/TeamsContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function TeamSettings() {
  const { teams, addTeam, removeTeam, reorderTeams } = useTeams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teamName = newTeam.trim();
    
    if (!teamName) {
      toast.error("チーム名を入力してください");
      return;
    }

    if (teams.includes(teamName)) {
      toast.error("そのチーム名は既に存在します");
      return;
    }

    addTeam(teamName);
    setIsDialogOpen(false);
    setNewTeam('');
    toast.success("チームを追加しました");
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newTeamOrder = Array.from(teams);
    const [reorderedItem] = newTeamOrder.splice(result.source.index, 1);
    newTeamOrder.splice(result.destination.index, 0, reorderedItem);

    reorderTeams(newTeamOrder);
    toast.success("チームの順序を更新しました");
  };

  const handleRemoveTeam = (team: string) => {
    removeTeam(team);
    toast.success("チームを削除しました");
  };

  return (
    <Card className="divide-y divide-gray-200">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="team-settings" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900">チーム設定</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      チームを追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                      <DialogTitle>新しいチームを追加</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          チーム名
                        </label>
                        <Input
                          value={newTeam}
                          onChange={(e) => setNewTeam(e.target.value)}
                          placeholder="例: 2A, 3B など"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} type="button">
                          キャンセル
                        </Button>
                        <Button type="submit">追加</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="teams">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {teams.map((team, index) => (
                          <Draggable key={team} draggableId={team} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-2 p-2 bg-white border rounded-md group hover:bg-slate-50"
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-2 rounded hover:bg-slate-100"
                                >
                                  <GripVertical className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span>{team}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveTeam(team)}
                                  className="opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}