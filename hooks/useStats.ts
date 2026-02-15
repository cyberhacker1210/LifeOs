import { useMemo } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTrackerStore } from '@/stores/useTrackerStore';
import { startOfDay, endOfDay, isSameDay, subDays, eachDayOfInterval, format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

export function useStats() {
    const { tasks } = useTaskStore();
    const { sessions } = useTrackerStore();

    const stats = useMemo(() => {
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);

        // 1. Today's Totals
        const todaysSessions = sessions.filter(s =>
            s.endTime >= startOfToday.getTime() && s.endTime <= endOfToday.getTime()
        );

        const totalProductiveTimeToday = todaysSessions.reduce((acc, s) => acc + s.duration, 0);

        const tasksCompletedToday = tasks.filter(t =>
            t.status === 'done' &&
            t.updatedAt && // Assuming we track completion date, for now using updatedAt as proxy if 'done'
            isSameDay(new Date(t.updatedAt), today)
        ).length;

        // 2. Time Distribution (Group)
        const timeByGroup: Record<string, number> = {};
        sessions.forEach(s => {
            timeByGroup[s.group] = (timeByGroup[s.group] || 0) + s.duration;
        });

        const timeDistribution = Object.entries(timeByGroup)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // 3. Weekly Activity
        const last7Days = eachDayOfInterval({
            start: subDays(today, 6),
            end: today
        });

        const weeklyActivity = last7Days.map(day => {
            const dayStart = startOfDay(day).getTime();
            const dayEnd = endOfDay(day).getTime();

            const daySessions = sessions.filter(s =>
                s.endTime >= dayStart && s.endTime <= dayEnd
            );

            const durationArr = daySessions.reduce((acc, s) => acc + s.duration, 0);

            return {
                day: format(day, 'EEE', { locale: fr }), // Lun, Mar...
                minutes: Math.round(durationArr / 60),
                fullDate: day
            };
        });

        // 4. Streak Calculation
        // Naive approach: check everyday backwards from today/yesterday
        // A day counts if sessions.length > 0 OR tasks completed > 0
        // (For now, let's rely on Tracker sessions for streak)

        let streak = 0;
        let currentCheckDate = today;

        // If no activity today yet, check from yesterday to start the streak count
        // (So you don't lose streak just because you woke up)
        const hasActivityToday = todaysSessions.length > 0;
        if (!hasActivityToday) {
            currentCheckDate = subDays(today, 1);
        }

        while (true) {
            const dayStart = startOfDay(currentCheckDate).getTime();
            const dayEnd = endOfDay(currentCheckDate).getTime();

            const hasActivity = sessions.some(s => s.endTime >= dayStart && s.endTime <= dayEnd);

            if (hasActivity) {
                streak++;
                currentCheckDate = subDays(currentCheckDate, 1);
            } else {
                break;
            }
        }

        return {
            totalProductiveTimeToday,
            tasksCompletedToday,
            timeDistribution,
            weeklyActivity,
            currentStreak: streak
        };

    }, [tasks, sessions]);

    return stats;
}
