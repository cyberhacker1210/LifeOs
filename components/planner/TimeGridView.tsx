'use client';

import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/types/task';
import { PlannerTaskCard } from '@/components/planner/PlannerTaskCard';
import { cn } from '@/lib/utils';
import { format, isToday, addMinutes, parseISO, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, Wand2, Loader2 } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface TimeGridViewProps {
    date: Date;
    tasks: Task[];
}

const HOURS = Array.from({ length: 18 }).map((_, i) => i + 6); // 6h to 23h

export function TimeGridView({ date, tasks }: TimeGridViewProps) {
    const isCurrentDay = isToday(date);
    const { autoPlanTasks } = useTaskStore();
    const { user } = useAuthStore();
    const [isPlanning, setIsPlanning] = useState(false);

    const timedTasks = useMemo(() => {
        return tasks.filter(t => t.time);
    }, [tasks]);

    const untimedTasks = useMemo(() => {
        return tasks.filter(t => !t.time);
    }, [tasks]);

    const handleAutoPlan = async () => {
        if (!user) return;
        setIsPlanning(true);
        try {
            await autoPlanTasks(user.uid, date.toISOString().split('T')[0]);
        } finally {
            setIsPlanning(false);
        }
    };

    const getTaskStyle = (task: Task) => {
        if (!task.time) return {};
        const [hours, minutes] = task.time.split(':').map(Number);
        const startMinutes = (hours * 60) + minutes;
        const offsetMinutes = startMinutes - (6 * 60); // Offset from 6h

        const top = (offsetMinutes / 60) * 80; // 80px per hour
        const height = (task.duration || 60) * (80 / 60);

        // Conflict Detection
        const isConflicting = timedTasks.some(other => {
            if (other.id === task.id) return false;
            const [oH, oM] = other.time!.split(':').map(Number);
            const otherStart = (oH * 60) + oM;
            const otherEnd = otherStart + (other.duration || 60);
            const taskEnd = startMinutes + (task.duration || 60);

            return (startMinutes < otherEnd && taskEnd > otherStart);
        });

        return {
            top: `${top}px`,
            height: `${height}px`,
            position: 'absolute' as const,
            left: '4px',
            right: '4px',
            zIndex: isConflicting ? 20 : 10,
            border: isConflicting ? '1px solid rgba(239, 68, 68, 0.5)' : undefined,
            boxShadow: isConflicting ? '0 0 10px rgba(239, 68, 68, 0.2)' : undefined,
        };
    };

    const isConflicting = (task: Task) => {
        if (!task.time) return false;
        const [hours, minutes] = task.time.split(':').map(Number);
        const start = (hours * 60) + minutes;
        const end = start + (task.duration || 60);

        return timedTasks.some(other => {
            if (other.id === task.id) return false;
            const [oH, oM] = other.time!.split(':').map(Number);
            const otherStart = (oH * 60) + oM;
            const otherEnd = otherStart + (other.duration || 60);
            return (start < otherEnd && end > otherStart);
        });
    };

    return (
        <div className="flex flex-col h-full bg-background rounded-xl border border-white/10 overflow-hidden shadow-2xl relative">
            <div className={cn(
                "p-6 border-b bg-muted/30 backdrop-blur-md flex items-center justify-between",
                isCurrentDay && "border-primary/30 bg-primary/5"
            )}>
                <div>
                    <h3 className="text-2xl font-bold capitalize">
                        {format(date, 'EEEE d MMMM', { locale: fr })}
                    </h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            isCurrentDay ? "bg-green-500 animate-pulse" : "bg-gray-500"
                        )} />
                        {timedTasks.length} tâches planifiées • {untimedTasks.length} non planifiées
                    </p>
                </div>

                {untimedTasks.length > 0 && (
                    <Button
                        onClick={handleAutoPlan}
                        disabled={isPlanning}
                        variant="outline"
                        className="gap-2 bg-primary/10 border-primary/20 hover:bg-primary/20 text-primary"
                    >
                        {isPlanning ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="h-4 w-4" />
                        )}
                        Planifier intelligemment
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Vertical Time Grid */}
                <div className="flex-1 overflow-y-auto relative h-[calc(100vh-300px)] custom-scrollbar">
                    {/* Time labels axis */}
                    <div className="absolute left-0 top-0 w-16 h-full border-r border-white/5 bg-muted/10" />

                    <div className="relative ml-16" style={{ height: `${HOURS.length * 80}px` }}>
                        {/* Hour lines */}
                        {HOURS.map(hour => (
                            <div
                                key={hour}
                                className="absolute left-0 right-0 border-b border-white/5 flex items-start"
                                style={{ top: `${(hour - 6) * 80}px`, height: '80px' }}
                            >
                                <div className="absolute -left-14 top-0 text-[10px] font-mono text-muted-foreground tracking-tighter">
                                    {hour.toString().padStart(2, '0')}:00
                                </div>
                            </div>
                        ))}

                        {/* Drop zones for each hour */}
                        {HOURS.map(hour => (
                            <TimeSlot key={hour} hour={hour} date={date} />
                        ))}

                        {/* Task Cards */}
                        {timedTasks.map(task => (
                            <div key={task.id} style={getTaskStyle(task)} className="z-10 group/card">
                                <PlannerTaskCard task={task} />
                                {isConflicting(task) && (
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg z-30 animate-pulse">
                                        <AlertCircle className="h-3 w-3" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Current Time Indicator */}
                        {isCurrentDay && <CurrentTimeIndicator />}
                    </div>
                </div>

                {/* Untimed Tasks Sidebar/List */}
                <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-white/10 bg-muted/20 p-4 overflow-y-auto overflow-x-hidden">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">À planifier</h4>
                    <div className="space-y-3">
                        {untimedTasks.map(task => (
                            <PlannerTaskCard key={task.id} task={task} />
                        ))}
                        {untimedTasks.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl opacity-40">
                                <p className="text-xs">Toutes les tâches sont planifiées</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TimeSlot({ hour, date }: { hour: number, date: Date }) {
    const id = `${date.toISOString().split('T')[0]}T${hour.toString().padStart(2, '0')}:00`;
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { date, hour },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "absolute left-0 right-0 h-20 transition-colors",
                isOver && "bg-primary/10"
            )}
            style={{ top: `${(hour - 6) * 80}px` }}
        />
    );
}

function CurrentTimeIndicator() {
    const [now, setNow] = useMemo(() => {
        const d = new Date();
        return [d.getHours(), d.getMinutes()];
    }, []);

    if (now < 6 || now > 23) return null;

    const top = ((now - 6) * 60 + setNow) * (80 / 60);

    return (
        <div
            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
            style={{ top: `${top}px` }}
        >
            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <div className="flex-1 h-[1px] bg-red-500/50 shadow-[0_0_4px_rgba(239,68,68,0.3)]" />
        </div>
    );
}
