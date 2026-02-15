'use client';

import { useTaskStore } from '@/stores/useTaskStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { TaskItem } from '@/components/tasks/TaskItem';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX } from 'lucide-react';
import { isToday, isPast, isFuture, parseISO } from 'date-fns';

interface TaskListProps {
    search: string;
    groups: string[];
    priorities: string[];
    dateFilter: string | null;
}

export function TaskList({ search, groups, priorities, dateFilter }: TaskListProps) {
    const { tasks, loading, error } = useTaskStore();
    const { user } = useAuthStore();

    if (loading && tasks.length === 0) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center py-4">
                Erreur: {error}
            </div>
        );
    }

    // Apply filters
    const filteredTasks = tasks.filter(task => {
        // Search filter
        if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;

        // Group filter
        if (groups.length > 0 && !groups.includes(task.group)) return false;

        // Priority filter
        if (priorities.length > 0 && !priorities.includes(task.priority)) return false;

        // Date filter
        if (dateFilter) {
            if (!task.date) return false;
            const taskDate = parseISO(task.date);
            if (dateFilter === 'today' && !isToday(taskDate)) return false;
            if (dateFilter === 'overdue' && (!isPast(taskDate) || isToday(taskDate))) return false;
            if (dateFilter === 'upcoming' && !isFuture(taskDate)) return false;
        }

        return true;
    });

    const todoTasks = filteredTasks.filter(t => t.status !== 'done' && t.status !== 'archived');
    const doneTasks = filteredTasks.filter(t => t.status === 'done');

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                {todoTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                ))}

                {todoTasks.length === 0 && tasks.length > 0 && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-white/5">
                        <SearchX className="h-8 w-8 mx-auto mb-3 opacity-20" />
                        <p>Aucune tâche ne correspond à vos filtres</p>
                        <Button variant="link" onClick={() => window.location.reload()} className="text-xs">
                            Réinitialiser
                        </Button>
                    </div>
                )}

                {tasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Aucune tâche à faire 🎉</p>
                        <p className="text-sm">Ajoutez-en une ci-dessus !</p>
                    </div>
                )}
            </div>

            {doneTasks.length > 0 && (
                <div className="pt-8">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Terminées ({doneTasks.length})</h3>
                    <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                        {doneTasks.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
