'use client';

import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/types/task';
import { PlannerTaskCard } from '@/components/planner/PlannerTaskCard';
import { cn } from '@/lib/utils';
import { InboxIcon } from 'lucide-react';

interface UnassignedTasksProps {
    tasks: Task[];
}

export function UnassignedTasks({ tasks }: UnassignedTasksProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'unassigned',
        data: { type: 'unassigned' },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "w-[220px] flex-shrink-0 flex flex-col rounded-lg border bg-muted/20 transition-colors",
                isOver && "bg-primary/5 ring-2 ring-primary/20"
            )}
        >
            <div className="p-3 border-b text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                    <InboxIcon className="h-4 w-4" />
                    Non planifiées
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                    {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {tasks.length === 0 ? (
                    <div className="text-center text-xs text-muted-foreground py-8">
                        Toutes les tâches sont planifiées ! 🎉
                    </div>
                ) : (
                    tasks.map(task => (
                        <PlannerTaskCard key={task.id} task={task} />
                    ))
                )}
            </div>
        </div>
    );
}
