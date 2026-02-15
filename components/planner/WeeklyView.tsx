'use client';

import { useState, useMemo } from 'react';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { startOfWeek, addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTaskStore } from '@/stores/useTaskStore';
import { DayColumn } from '@/components/planner/DayColumn';
import { UnassignedTasks } from '@/components/planner/UnassignedTasks';
import { PlannerTaskCard } from '@/components/planner/PlannerTaskCard';
import { Task } from '@/types/task';

interface WeeklyViewProps {
    currentDate: Date;
}

export function WeeklyView({ currentDate }: WeeklyViewProps) {
    const { tasks, updateTaskDate } = useTaskStore();
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor)
    );

    const days = useMemo(() => {
        const start = startOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, [currentDate]);

    const tasksByDay = useMemo(() => {
        const map = new Map<string, Task[]>();
        days.forEach(day => map.set(day.toISOString().split('T')[0], []));

        tasks.forEach(task => {
            if (task.date) {
                const dateKey = task.date;
                if (map.has(dateKey)) {
                    map.get(dateKey)?.push(task);
                }
            }
        });
        return map;
    }, [tasks, days]);

    const unassignedTasks = useMemo(() => {
        return tasks.filter(task => !task.date && task.status !== 'done');
    }, [tasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = active.data.current?.task as Task;
        setActiveTask(task);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        const taskId = active.id as string;
        const overId = over.id as string;

        // Check if dropped on "unassigned" zone
        if (overId === 'unassigned') {
            if (activeTask && activeTask.date) {
                await updateTaskDate(taskId, '');
            }
        } else {
            // over.id is the date ISO string from DayColumn
            const newDate = overId.split('T')[0];
            if (activeTask && activeTask.date !== newDate) {
                await updateTaskDate(taskId, newDate);
            }
        }

        setActiveTask(null);
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 h-full">
                {/* Unassigned tasks sidebar */}
                <UnassignedTasks tasks={unassignedTasks} />

                {/* Weekly columns */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-7 gap-2 overflow-y-auto">
                    {days.map(day => (
                        <DayColumn
                            key={day.toISOString()}
                            date={day}
                            tasks={tasksByDay.get(day.toISOString().split('T')[0]) || []}
                        />
                    ))}
                </div>
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div className="opacity-80 rotate-2 cursor-grabbing w-[200px]">
                        <PlannerTaskCard task={activeTask} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
