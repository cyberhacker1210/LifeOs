'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTrackerStore } from '@/stores/useTrackerStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { usePlannerStore } from '@/stores/usePlannerStore';

export function DataLoader() {
    const { user, subscribeToProfile } = useAuthStore();
    const { subscribe: subscribeTasks } = useTaskStore();
    const { subscribeToHistory: subscribeTracker } = useTrackerStore();
    const { fetchHabits: subscribeHabits } = useHabitStore();
    const { fetchPlans: subscribePlanner } = usePlannerStore();

    useEffect(() => {
        if (!user) return;

        const unsubProfile = subscribeToProfile(user.uid);
        const unsubTasks = subscribeTasks(user.uid);
        const unsubTracker = subscribeTracker(user.uid);
        const unsubHabits = subscribeHabits(user.uid);
        const unsubPlanner = subscribePlanner(user.uid);

        return () => {
            unsubProfile();
            unsubTasks();
            unsubTracker();
            unsubHabits();
            unsubPlanner();
        };
    }, [user, subscribeToProfile, subscribeTasks, subscribeTracker, subscribeHabits, subscribePlanner]);

    return null;
}
