import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PlannerViewMode = 'week' | 'day';

interface PlannerHeaderProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    viewMode: PlannerViewMode;
    onViewModeChange: (mode: PlannerViewMode) => void;
    taskCount?: number;
}

export function PlannerHeader({
    currentDate,
    onDateChange,
    viewMode,
    onViewModeChange,
    taskCount
}: PlannerHeaderProps) {
    const start = startOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });

    const handlePrev = () => onDateChange(viewMode === 'week' ? subWeeks(currentDate, 1) : addDays(currentDate, -1));
    const handleNext = () => onDateChange(viewMode === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1));
    const handleToday = () => onDateChange(new Date());

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold capitalize">
                        {viewMode === 'week' ? format(start, 'MMMM yyyy', { locale: fr }) : format(currentDate, 'EEEE d MMMM', { locale: fr })}
                    </h2>
                    {taskCount !== undefined && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                            {taskCount} tâches
                        </span>
                    )}
                </div>
                <div className="text-muted-foreground text-sm">
                    {viewMode === 'week'
                        ? `Semaine du ${format(start, 'd', { locale: fr })} au ${format(end, 'd MMMM', { locale: fr })}`
                        : "Vue quotidienne détaillée"}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex bg-muted/30 p-1 rounded-lg border border-white/5 backdrop-blur-md">
                    <Button
                        variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('week')}
                        className="gap-2"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Semaine
                    </Button>
                    <Button
                        variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('day')}
                        className="gap-2"
                    >
                        <List className="h-4 w-4" />
                        Jour
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrev} className="bg-background/50 border-white/10 hover:bg-white/10">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleToday} className="gap-2 bg-background/50 border-white/10 hover:bg-white/10">
                        <Calendar className="h-4 w-4" />
                        Aujourd'hui
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNext} className="bg-background/50 border-white/10 hover:bg-white/10">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
