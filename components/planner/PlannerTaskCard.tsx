'use client';

import { useDraggable } from '@dnd-kit/core';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { GripVertical, CheckCircle2, Circle, FileText } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';

interface PlannerTaskCardProps {
    task: Task;
}

export function PlannerTaskCard({ task }: PlannerTaskCardProps) {
    const { toggleTaskStatus } = useTaskStore();
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { task },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleTaskStatus(task.id, task.status);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative flex items-center gap-2 p-2 rounded-md border bg-card shadow-sm transition-colors",
                isDragging && "opacity-50 z-50 ring-2 ring-primary",
                task.status === 'done' && "opacity-60 bg-muted/50"
            )}
        >
            <div
                {...listeners}
                {...attributes}
                className="cursor-grab active:cursor-grabbing touch-none"
            >
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <button onClick={handleToggle} className="flex-shrink-0">
                {task.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                    <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                )}
            </button>

            <div className="flex-1 min-w-0">
                <div className={cn(
                    "text-sm font-medium truncate",
                    task.status === 'done' && "line-through text-muted-foreground"
                )}>
                    {task.title}
                </div>
                {task.notes && (
                    <p className="text-[10px] text-muted-foreground/60 line-clamp-1 mt-0.5 italic">
                        {task.notes}
                    </p>
                )}
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn(
                        "w-2 h-2 rounded-full",
                        task.group === 'Scolaire' && "bg-indigo-500",
                        task.group === 'Sport' && "bg-emerald-500",
                        task.group === 'Perso' && "bg-amber-500",
                        task.group === 'Projets' && "bg-pink-500",
                    )} />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {task.group}
                    </span>
                    {task.notes && <FileText className="h-2.5 w-2.5 text-muted-foreground/40" />}
                    {task.priority === 'urgent' && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1 rounded ml-auto">
                            !
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
