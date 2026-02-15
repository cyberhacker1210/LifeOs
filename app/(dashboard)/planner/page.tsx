'use client';

import { useState } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { DayPlanner } from '@/components/planner/DayPlanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlannerHeader } from '@/components/planner/PlannerHeader';
import { WeeklyView } from '@/components/planner/WeeklyView';
import { Loader2 } from 'lucide-react';

export default function PlannerPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'planning' | 'habits' | 'week'>('planning');
    const { tasks, loading } = useTaskStore();
    const { user } = useAuthStore();

    if (loading && tasks.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const tasksForCurrentDay = tasks.filter(t => t.date === currentDate.toISOString().split('T')[0]);

    return (
        <div className="flex flex-col h-full max-h-screen overflow-hidden p-4 space-y-4">
            <PlannerHeader
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                viewMode={viewMode === 'habits' ? 'day' : viewMode === 'week' ? 'week' : 'day'}
                onViewModeChange={(v) => setViewMode(v as any)}
                taskCount={tasksForCurrentDay.length}
            />

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-fit mb-4 p-1 bg-white/5 border border-white/10">
                    <TabsTrigger value="planning" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Planning</TabsTrigger>
                    <TabsTrigger value="habits" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Gestion Habitudes</TabsTrigger>
                    <TabsTrigger value="week" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Aperçu Semaine</TabsTrigger>
                </TabsList>

                <div className="flex-1 min-h-0 overflow-hidden">
                    <TabsContent value="planning" className="h-full mt-0 focus-visible:ring-0">
                        <DayPlanner date={currentDate} onViewHabits={() => setViewMode('habits')} />
                    </TabsContent>

                    <TabsContent value="habits" className="h-full mt-0 focus-visible:ring-0 overflow-y-auto custom-scrollbar pr-2">
                        <HabitTracker />
                    </TabsContent>

                    <TabsContent value="week" className="h-full mt-0 focus-visible:ring-0">
                        <WeeklyView currentDate={currentDate} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
