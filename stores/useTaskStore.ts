import { create } from 'zustand';
import { Task, TaskStatus } from '@/types/task';
import {
    collection,
    onSnapshot,
    query,
    where,
    orderBy,
    addDoc,
    updateDoc,
    deleteDoc,
    deleteField,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface TaskState {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    subscribe: (userId: string) => () => void;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, userId: string) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    updateTaskDate: (taskId: string, date: string) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    toggleTaskStatus: (taskId: string, currentStatus: TaskStatus) => Promise<void>;
    addSubTask: (taskId: string, title: string) => Promise<void>;
    updateSubTask: (taskId: string, subTaskId: string, completed: boolean) => Promise<void>;
    deleteSubTask: (taskId: string, subTaskId: string) => Promise<void>;
    archiveOldTasks: (userId: string) => Promise<void>;
    autoPlanTasks: (userId: string, date: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    loading: false,
    error: null,

    subscribe: (userId: string) => {
        set({ loading: true });

        // Safety check for dummy environment or missing config
        if (!db) {
            set({ loading: false, error: "Firestore not initialized" });
            return () => { };
        }

        try {
            const q = query(
                collection(db, 'tasks'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const tasks = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Task[];

                set({ tasks, loading: false });
                get().archiveOldTasks(userId);
            }, (error) => {
                console.error("Firestore subscription error:", error);
                set({ error: error.message, loading: false });
            });

            return unsubscribe;
        } catch (e: any) {
            console.error("Error setting up tasks subscription:", e);
            set({ loading: false, error: e.message });
            return () => { };
        }
    },

    addTask: async (taskData, userId) => {
        try {
            if (!db) throw new Error("Database not initialized");

            const now = Date.now();

            // Clean undefined values
            const cleanTaskData = Object.fromEntries(
                Object.entries(taskData).filter(([_, v]) => v !== undefined)
            );

            await addDoc(collection(db, 'tasks'), {
                ...cleanTaskData,
                userId,
                createdAt: now,
                updatedAt: now,
                subTasks: taskData.subTasks || [],
            });
            toast.success('Tâche ajoutée');
        } catch (error: any) {
            console.error(error);
            toast.error('Erreur lors de l\'ajout de la tâche');
        }
    },

    updateTask: async (taskId, updates) => {
        try {
            if (!db) throw new Error("Database not initialized");

            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, {
                ...updates,
                updatedAt: Date.now(),
            });
        } catch (error: any) {
            console.error(error);
            toast.error('Erreur lors de la modification');
        }
    },

    updateTaskDate: async (taskId: string, date: string) => {
        const { tasks } = get();

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Optimistic update
        const updatedTasks = tasks.map((t) =>
            t.id === taskId ? { ...t, date: date || undefined } : t
        );
        set({ tasks: updatedTasks });

        try {
            if (!db) throw new Error("Database not initialized");
            const taskRef = doc(db, 'tasks', taskId);
            if (date) {
                await updateDoc(taskRef, { date, updatedAt: Date.now() });
            } else {
                await updateDoc(taskRef, { date: deleteField(), updatedAt: Date.now() });
            }
        } catch (error) {
            console.error("Error updating task date:", error);
            toast.error("Erreur lors de la mise à jour de la date");
            // Revert if failed
            set({ tasks });
        }
    },

    deleteTask: async (taskId) => {
        try {
            if (!db) throw new Error("Database not initialized");

            await deleteDoc(doc(db, 'tasks', taskId));
            toast.success('Tâche supprimée');
        } catch (error: any) {
            console.error(error);
            toast.error('Erreur lors de la suppression');
        }
    },

    toggleTaskStatus: async (taskId, currentStatus) => {
        const newStatus = currentStatus === 'done' ? 'todo' : 'done';
        const updates: any = { status: newStatus };
        if (newStatus === 'done') {
            updates.completedAt = Date.now();
        } else {
            updates.completedAt = null;
        }
        await get().updateTask(taskId, updates);
    },

    addSubTask: async (taskId, title) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const newSubTask = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            completed: false
        };

        const updatedSubTasks = [...(task.subTasks || []), newSubTask];

        // Optimistic update
        set({
            tasks: tasks.map(t => t.id === taskId ? { ...t, subTasks: updatedSubTasks } : t)
        });

        try {
            await updateDoc(doc(db, 'tasks', taskId), {
                subTasks: updatedSubTasks,
                updatedAt: Date.now()
            });
        } catch (error) {
            console.error(error);
            set({ tasks }); // Revert
            toast.error("Erreur lors de l'ajout de la sous-tâche");
        }
    },

    updateSubTask: async (taskId, subTaskId, completed) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.subTasks) return;

        const updatedSubTasks = task.subTasks.map(st =>
            st.id === subTaskId ? { ...st, completed } : st
        );

        // Optimistic update
        set({
            tasks: tasks.map(t => t.id === taskId ? { ...t, subTasks: updatedSubTasks } : t)
        });

        try {
            await updateDoc(doc(db, 'tasks', taskId), {
                subTasks: updatedSubTasks,
                updatedAt: Date.now()
            });
        } catch (error) {
            console.error(error);
            set({ tasks }); // Revert
            toast.error("Erreur lors de la mise à jour");
        }
    },

    deleteSubTask: async (taskId, subTaskId) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.subTasks) return;

        const updatedSubTasks = task.subTasks.filter(st => st.id !== subTaskId);

        // Optimistic update
        set({
            tasks: tasks.map(t => t.id === taskId ? { ...t, subTasks: updatedSubTasks } : t)
        });

        try {
            await updateDoc(doc(db, 'tasks', taskId), {
                subTasks: updatedSubTasks,
                updatedAt: Date.now()
            });
        } catch (error) {
            console.error(error);
            set({ tasks }); // Revert
            toast.error("Erreur lors de la suppression");
        }
    },

    archiveOldTasks: async (userId) => {
        const { tasks } = get();
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        const tasksToArchive = tasks.filter(t =>
            t.status === 'done' &&
            t.completedAt &&
            (now - t.completedAt) > twentyFourHours
        );

        if (tasksToArchive.length === 0) return;

        // No-op logically, just log removed

        for (const task of tasksToArchive) {
            try {
                await updateDoc(doc(db, 'tasks', task.id), {
                    status: 'archived',
                    updatedAt: now
                });
            } catch (error) {
                console.error(`Failed to archive task ${task.id}:`, error);
            }
        }
    },

    autoPlanTasks: async (userId, date) => {
        const { tasks } = get();
        const dayTasks = tasks.filter(t => t.date === date);
        const unassigned = dayTasks.filter(t => !t.time && t.status !== 'done');
        const assigned = dayTasks.filter(t => t.time);

        if (unassigned.length === 0) {
            toast.info("Aucune tâche à planifier pour ce jour");
            return;
        }

        // Sort unassigned by priority
        const priorityScore = { urgent: 4, high: 3, normal: 2, low: 1 };
        unassigned.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

        let currentMinutes = 9 * 60; // Start at 09:00
        const updatedTasks = [...tasks];
        const changes: { id: string, time: string, duration: number }[] = [];

        for (const task of unassigned) {
            const duration = task.duration || 60;

            // Find next available slot
            let slotFound = false;
            while (currentMinutes + duration <= 22 * 60) { // Until 22:00
                const hasConflict = assigned.some(other => {
                    const [oH, oM] = other.time!.split(':').map(Number);
                    const oStart = (oH * 60) + oM;
                    const oEnd = oStart + (other.duration || 60);
                    return (currentMinutes < oEnd && (currentMinutes + duration) > oStart);
                });

                if (!hasConflict) {
                    slotFound = true;
                    break;
                }
                currentMinutes += 30; // Check every 30 min
            }

            if (slotFound) {
                const hours = Math.floor(currentMinutes / 60);
                const mins = currentMinutes % 60;
                const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

                changes.push({ id: task.id, time: timeStr, duration });
                currentMinutes += duration;
            }
        }

        if (changes.length === 0) {
            toast.error("Impossible de trouver des créneaux libres");
            return;
        }

        // Apply changes
        for (const change of changes) {
            try {
                await updateDoc(doc(db, 'tasks', change.id), {
                    time: change.time,
                    duration: change.duration,
                    updatedAt: Date.now()
                });
            } catch (error) {
                console.error(`Error auto-planning task ${change.id}:`, error);
            }
        }

        toast.success(`${changes.length} tâches planifiées automatiquement`);
    }
}));
