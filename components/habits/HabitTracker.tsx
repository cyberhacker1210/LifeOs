'use client';

import { useState } from 'react';
import { useHabitStore } from '@/stores/useHabitStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Flame, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HabitCreator } from './HabitCreator';

export function HabitTracker() {
    const { habits, completions, toggleHabitComplete } = useHabitStore();
    const { user } = useAuthStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const goToPrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Mes Habitudes</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[120px] text-center font-medium capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                    </span>
                    <Button variant="outline" size="icon" onClick={goToNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <HabitCreator>
                        <Button size="sm" className="ml-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle habitude
                        </Button>
                    </HabitCreator>
                </div>
            </div>

            <div className="grid gap-4">
                {habits.length === 0 ? (
                    <Card className="glass-card">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <p className="text-muted-foreground mb-4">Tu n'as pas encore d'habitudes. Crée-en une pour commencer !</p>
                            <HabitCreator>
                                <Button variant="outline">Créer ma première habitude</Button>
                            </HabitCreator>
                        </CardContent>
                    </Card>
                ) : (
                    habits.map((habit) => (
                        <Card key={habit.id} className="glass-card overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${habit.color}20`, color: habit.color }}>
                                        {habit.icon}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{habit.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{habit.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-orange-500 font-bold">
                                        <Flame className="h-5 w-5 fill-current" />
                                        <span>{habit.currentStreak}j</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mr-2">
                                        Record: {habit.bestStreak}j
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        onClick={() => {
                                            if (confirm(`Supprimer l'habitude "${habit.name}" ?`)) {
                                                useHabitStore.getState().deleteHabit(habit.id);
                                            }
                                        }}
                                    >
                                        <Plus className="h-4 w-4 rotate-45" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 pt-0">
                                <div className="flex flex-wrap gap-1">
                                    {days.map((day) => {
                                        const dateStr = format(day, 'yyyy-MM-dd');
                                        const isCompleted = completions.some(c => c.habitId === habit.id && c.date === dateStr);
                                        const isToday = isSameDay(day, new Date());

                                        return (
                                            <div
                                                key={dateStr}
                                                onClick={() => user && toggleHabitComplete(habit.id, user.uid, dateStr)}
                                                className={cn(
                                                    "w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all text-[10px]",
                                                    isCompleted
                                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                                        : "bg-muted/30 hover:bg-muted/60 text-muted-foreground/50",
                                                    isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                                )}
                                                title={format(day, 'dd MMMM', { locale: fr })}
                                            >
                                                {isCompleted ? <Check className="h-4 w-4" /> : format(day, 'd')}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
