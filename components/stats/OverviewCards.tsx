'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStats } from '@/hooks/useStats';
import { Flame, Timer, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OverviewCards() {
    const { currentStreak, totalProductiveTimeToday, tasksCompletedToday } = useStats();

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h${m.toString().padStart(2, '0')}`;
    };

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Série actuelle
                    </CardTitle>
                    <Flame className={cn("h-4 w-4 text-muted-foreground", currentStreak > 0 && "text-orange-500 fill-orange-500")} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentStreak} jours</div>
                    <p className="text-xs text-muted-foreground">
                        Continuez comme ça ! 🔥
                    </p>
                </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Focus aujourd'hui
                    </CardTitle>
                    <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatDuration(totalProductiveTimeToday)}</div>
                    <p className="text-xs text-muted-foreground">
                        Temps productif total
                    </p>
                </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Tâches terminées
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{tasksCompletedToday}</div>
                    <p className="text-xs text-muted-foreground">
                        Tâches accomplies aujourd'hui
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
