'use client';

import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/types/task';
import { PlannerTaskCard } from '@/components/planner/PlannerTaskCard';
import { cn } from '@/lib/utils';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useAuthStore } from '@/stores/useAuthStore';

interface DayColumnProps {
    date: Date;
    tasks: Task[];
}

export function DayColumn({ date, tasks }: DayColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: date.toISOString(),
        data: { date },
    });

    const { addTask } = useTaskStore();
    const { user } = useAuthStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const isCurrentDay = isToday(date);
    const dateKey = date.toISOString().split('T')[0];

    const handleAddTask = async () => {
        if (!newTaskTitle.trim() || !user) return;

        await addTask({
            title: newTaskTitle.trim(),
            group: 'Perso',
            priority: 'normal',
            status: 'todo',
            date: dateKey,
            subTasks: [],
        }, user.uid);

        setNewTaskTitle('');
        setIsAdding(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTask();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewTaskTitle('');
        }
    };

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col h-full min-h-[500px] rounded-lg border bg-muted/20 transition-colors",
                isOver && "bg-primary/5 ring-2 ring-primary/20",
                isCurrentDay && "bg-blue-500/5 border-blue-500/30"
            )}
        >
            <div className={cn(
                "p-3 border-b text-center",
                isCurrentDay && "bg-blue-500/10 text-blue-400"
            )}>
                <div className="text-sm font-medium capitalize">
                    {format(date, 'EEEE', { locale: fr })}
                </div>
                <div className={cn(
                    "text-2xl font-bold",
                    isCurrentDay && "text-blue-400"
                )}>
                    {format(date, 'd', { locale: fr })}
                </div>
            </div>

            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {tasks.map(task => (
                    <PlannerTaskCard key={task.id} task={task} />
                ))}

                {isAdding ? (
                    <input
                        autoFocus
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                            if (newTaskTitle.trim()) {
                                handleAddTask();
                            } else {
                                setIsAdding(false);
                            }
                        }}
                        placeholder="Nom de la tâche..."
                        className="w-full text-sm px-2 py-1.5 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter
                    </button>
                )}
            </div>
        </div>
    );
}
