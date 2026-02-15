import { create } from 'zustand';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    setDoc,
    getDocs,
    orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Habit, HabitCompletion, Routine } from '@/types/habit';
import { toast } from 'sonner';

interface HabitState {
    habits: Habit[];
    completions: HabitCompletion[];
    routines: Routine[];
    activeRoutineHabitId: string | null;
    loading: boolean;

    // Actions
    fetchHabits: (userId: string) => () => void;
    addHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'totalCompletions' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;

    // Completions
    toggleHabitComplete: (habitId: string, userId: string, date: string, value?: number) => Promise<void>;
    deleteCompletion: (habitId: string, date: string) => Promise<void>;

    // Routines
    startRoutine: (routineId: string) => void;
    nextRoutineHabit: () => void;
    stopRoutine: () => void;

    // Analytics
    calculateStreaks: (habitId: string) => { current: number, best: number };
}

// Helper to remove undefined values before sending to Firestore
const cleanData = (data: any) => {
    return Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );
};

export const useHabitStore = create<HabitState>((set, get) => ({
    habits: [],
    completions: [],
    routines: [],
    activeRoutineHabitId: null,
    loading: false,

    fetchHabits: (userId: string) => {
        console.log("Fetching habits for userId:", userId);
        if (!userId) {
            console.warn("fetchHabits called without userId");
            return () => { };
        }
        set({ loading: true });

        // Subscribe to habits
        const habitsQuery = query(collection(db, 'habits'), where('userId', '==', userId));
        const unsubHabits = onSnapshot(habitsQuery, (snapshot) => {
            const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
            set({ habits });
        });

        // Subscribe to completions (limiting to recent for performance, or handle pagination)
        const completionsQuery = query(
            collection(db, 'habit_completions'),
            where('userId', '==', userId)
        );
        const unsubCompletions = onSnapshot(completionsQuery, (snapshot) => {
            const completions = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as HabitCompletion))
                .sort((a, b) => b.timestamp - a.timestamp);
            set({ completions, loading: false });
        });

        return () => {
            unsubHabits();
            unsubCompletions();
        };
    },

    addHabit: async (habitData) => {
        const now = Date.now();
        const newHabit: Omit<Habit, 'id'> = {
            ...habitData,
            currentStreak: 0,
            bestStreak: 0,
            totalCompletions: 0,
            createdAt: now,
            updatedAt: now,
        };
        await addDoc(collection(db, 'habits'), cleanData(newHabit));
        toast.success("Habitude créée ! 💪");
    },

    updateHabit: async (id, updates) => {
        const habitRef = doc(db, 'habits', id);
        await updateDoc(habitRef, { ...cleanData(updates), updatedAt: Date.now() });
    },

    deleteHabit: async (id) => {
        await deleteDoc(doc(db, 'habits', id));
        toast.info("Habitude supprimée.");
    },

    toggleHabitComplete: async (habitId, userId, date, value) => {
        const { habits, completions } = get();
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        // Future date guard
        const today = new Date().toISOString().split('T')[0];
        if (date > today) {
            toast.error("Tu ne peux pas valider une habitude pour le futur ! 🕰️");
            return;
        }

        const existingCompletion = completions.find(c => c.habitId === habitId && c.date === date);

        if (existingCompletion) {
            // Already completed, so we "uncheck" it by deleting the completion
            await get().deleteCompletion(habitId, date);
            toast.info(`${habit.name} : Annulé`);
        } else {
            // Create new completion
            const newCompletion: Omit<HabitCompletion, 'id'> = {
                habitId,
                userId,
                date,
                timestamp: Date.now(),
                value,
                status: 'completed'
            };
            await addDoc(collection(db, 'habit_completions'), cleanData(newCompletion));

            // Trigger streak recalculation
            const { current, best } = get().calculateStreaks(habitId);
            await get().updateHabit(habitId, {
                currentStreak: current,
                bestStreak: Math.max(best, habit.bestStreak),
                totalCompletions: habit.totalCompletions + 1,
                lastCompleted: Date.now()
            });

            toast.success(`${habit.name} : Bien joué ! 🔥`);
        }
    },

    deleteCompletion: async (habitId, date) => {
        const { completions } = get();
        const completion = completions.find(c => c.habitId === habitId && c.date === date);
        if (completion) {
            await deleteDoc(doc(db, 'habit_completions', completion.id));

            // Recalculate streaks (downwards)
            const { current } = get().calculateStreaks(habitId);
            await get().updateHabit(habitId, {
                currentStreak: current,
                // Best streak doesn't typically decrease unless we want to manually fix it
            });
        }
    },

    calculateStreaks: (habitId) => {
        const { completions } = get();
        const habitCompletions = completions
            .filter(c => c.habitId === habitId)
            .sort((a, b) => b.date.localeCompare(a.date));

        if (habitCompletions.length === 0) return { current: 0, best: 0 };

        let current = 0;
        let best = 0;
        let tempStreak = 0;

        // Simplified streak logic: consecutive dates
        // Note: Real streak logic needs to account for freq (specific days etc)
        // For now, let's assume daily for the MVP streak calc

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const dates = habitCompletions.map(c => c.date);

        if (dates.includes(today) || dates.includes(yesterday)) {
            let checkDate = dates.includes(today) ? today : yesterday;
            let d = new Date(checkDate);

            while (dates.includes(d.toISOString().split('T')[0])) {
                current++;
                d.setDate(d.getDate() - 1);
            }
        }

        // Best streak calc
        let lastDate: number | null = null;
        dates.reverse().forEach(dateStr => {
            const date = new Date(dateStr).getTime();
            if (lastDate === null || date === lastDate + 86400000) {
                tempStreak++;
            } else {
                best = Math.max(best, tempStreak);
                tempStreak = 1;
            }
            lastDate = date;
        });
        best = Math.max(best, tempStreak);

        return { current, best };
    },

    startRoutine: (routineId) => {
        const routine = get().routines.find(r => r.id === routineId);
        if (routine && routine.habitIds.length > 0) {
            set({ activeRoutineHabitId: routine.habitIds[0] });
        }
    },

    nextRoutineHabit: () => {
        const { activeRoutineHabitId, routines, habits } = get();
        if (!activeRoutineHabitId) return;

        // Find which routine is active (simplification)
        const routine = routines.find(r => r.habitIds.includes(activeRoutineHabitId));
        if (!routine) return;

        const currentIndex = routine.habitIds.indexOf(activeRoutineHabitId);
        if (currentIndex < routine.habitIds.length - 1) {
            set({ activeRoutineHabitId: routine.habitIds[currentIndex + 1] });
        } else {
            set({ activeRoutineHabitId: null });
            toast.success("Routine terminée ! Félicitations ! ✨");
        }
    },

    stopRoutine: () => set({ activeRoutineHabitId: null })
}));
