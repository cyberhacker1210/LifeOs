'use client';

import { useTaskStore } from '@/stores/useTaskStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar, Clock, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';

export function MaJourneeList() {
    const { tasks, toggleTaskStatus } = useTaskStore();
    const today = format(new Date(), 'yyyy-MM-dd');

    const todayTasks = tasks
        .filter(t => t.date === today && t.status !== 'archived')
        .sort((a, b) => {
            // Sort by status (todo first), then by time, then by priority
            if (a.status !== b.status) return a.status === 'todo' ? -1 : 1;
            if (a.time && b.time) return a.time.localeCompare(b.time);
            if (a.time) return -1;
            if (b.time) return 1;
            const priorityScore = { urgent: 4, high: 3, normal: 2, low: 1 };
            return priorityScore[b.priority] - priorityScore[a.priority];
        })
        .slice(0, 5); // Just show the top 5 for the dashboard

    return (
        <Card className="glass-card border-white/5 h-full overflow-hidden flex flex-col">
            <div className="p-6 pb-2 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-wider">Ma Journée</h3>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {todayTasks.filter(t => t.status === 'done').length}/{todayTasks.length}
                </span>
            </div>

            <CardContent className="flex-1 p-0 overflow-y-auto">
                {todayTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50">
                        <Calendar className="w-8 h-8 mb-2" />
                        <p className="text-xs">Rien de prévu pour le moment</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {todayTasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group",
                                    task.status === 'done' && "opacity-50"
                                )}
                            >
                                <Checkbox
                                    checked={task.status === 'done'}
                                    onCheckedChange={() => toggleTaskStatus(task.id, task.status)}
                                    className="rounded-full w-5 h-5 border-2 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm font-bold truncate",
                                        task.status === 'done' && "line-through text-muted-foreground font-normal"
                                    )}>
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        {task.time && (
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {task.time}
                                            </span>
                                        )}
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold tracking-tighter",
                                            task.priority === 'urgent' ? "text-red-500" :
                                                task.priority === 'high' ? "text-orange-500" : "text-muted-foreground/60"
                                        )}>
                                            {task.group}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>

            {todayTasks.length > 0 && (
                <div className="p-3 bg-white/[0.02] text-center border-t border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">
                        Détails complets dans le Planner
                    </p>
                </div>
            )}
        </Card>
    );
}
