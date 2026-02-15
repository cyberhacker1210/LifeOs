'use client';

import { usePlannerStore } from '@/stores/usePlannerStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, GraduationCap, Briefcase, Coffee, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BlockCreator } from './BlockCreator';
import { DailyHabitList } from '@/components/habits/DailyHabitList';

interface DayPlannerProps {
    date: Date;
    onViewHabits?: () => void;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6h à 23h

export function DayPlanner({ date, onViewHabits }: DayPlannerProps) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const { getDayPlan } = usePlannerStore();
    const { startRoutine } = useHabitStore();
    const plan = getDayPlan(dateStr);

    const getIcon = (type: string) => {
        switch (type) {
            case 'school': return <GraduationCap className="h-4 w-4" />;
            case 'work': return <Briefcase className="h-4 w-4" />;
            case 'routine': return <Star className="h-4 w-4" />;
            case 'break': return <Coffee className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <div className="flex h-full gap-6">
            {/* Timeline Column */}
            <div className="flex-1 relative overflow-y-auto pr-4 custom-scrollbar">
                <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-border/50" />

                <div className="ml-16 relative min-h-[1440px]">
                    {HOURS.map((hour) => (
                        <div key={hour} className="h-20 border-b border-border/20 relative">
                            <span className="absolute -left-14 top-0 text-[10px] font-medium text-muted-foreground/60 w-12 text-right">
                                {hour}:00
                            </span>
                        </div>
                    ))}

                    {/* Blocks Layer */}
                    <div className="absolute inset-0 pt-0">
                        {plan?.blocks.map((block) => {
                            const [startH, startM] = block.startTime.split(':').map(Number);
                            const [endH, endM] = block.endTime.split(':').map(Number);

                            const top = ((startH - 6) * 80) + (startM / 60 * 80);
                            const height = ((endH - startH) * 80) + ((endM - startM) / 60 * 80);

                            return (
                                <div
                                    key={block.id}
                                    className={cn(
                                        "absolute left-2 right-2 rounded-lg border p-3 flex flex-col gap-1 overflow-hidden transition-all hover:scale-[1.01] hover:shadow-xl group",
                                        "glass-card border-l-4"
                                    )}
                                    style={{
                                        top: `${top}px`,
                                        height: `${height}px`,
                                        borderColor: block.color || 'var(--primary)',
                                        borderLeftColor: block.color || 'var(--primary)'
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded bg-black/20 text-white">
                                                {getIcon(block.type)}
                                            </div>
                                            <span className="font-bold text-sm truncate">{block.label}</span>
                                        </div>
                                        <span className="text-[10px] opacity-70 font-medium whitespace-nowrap">
                                            {block.startTime} - {block.endTime}
                                        </span>
                                    </div>
                                    {block.description && (
                                        <p className="text-[10px] opacity-60 line-clamp-2 leading-tight">
                                            {block.description}
                                        </p>
                                    )}

                                    {block.type === 'routine' && block.routineId && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="mt-auto h-7 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => startRoutine(block.routineId!)}
                                        >
                                            🚀 Lancer la routine
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Floating Add Button */}
                <div className="fixed bottom-8 right-[340px]">
                    <BlockCreator date={date} />
                </div>
            </div>

            {/* Side Column: Habits */}
            <div className="w-[300px] flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
                <Card className="glass-card border-white/5">
                    <CardContent className="p-4">
                        <DailyHabitList date={date} onViewHabits={onViewHabits} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
