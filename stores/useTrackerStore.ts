import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Session, ActiveSession, SessionType, SessionMetadata } from '@/types/tracker';
import { Task } from '@/types/task';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';

interface TrackerState {
    activeSession: ActiveSession;
    sessions: Session[]; // History
    loading: boolean;
    showFeedback: boolean;
    lastSavedSessionId: string | null;

    // Actions
    startTimer: () => void;
    pauseTimer: () => void;
    stopTimer: (userId: string) => Promise<void>;
    resetTimer: () => void;
    tick: () => void; // Called every second by a component

    setCategory: (group: string, subGroup?: string) => void;
    setTask: (task: Task) => void;
    setType: (type: SessionType) => void;
    setNotes: (notes: string) => void;
    setMetadata: (metadata: Partial<TrackerState['activeSession']['metadata']>) => void;
    setShowFeedback: (show: boolean) => void;
    updateSessionMetadata: (sessionId: string, metadata: SessionMetadata) => Promise<void>;

    subscribeToHistory: (userId: string) => () => void;
}

const DEFAULT_SESSION: ActiveSession = {
    startTime: null,
    elapsed: 0,
    isRunning: false,
    group: 'Perso',
    type: 'productive',
    notes: '',
};

export const useTrackerStore = create<TrackerState>()(
    persist(
        (set, get) => ({
            activeSession: DEFAULT_SESSION,
            sessions: [],
            loading: false,
            showFeedback: false,
            lastSavedSessionId: null,

            startTimer: () => {
                const { activeSession } = get();
                if (activeSession.isRunning) return;

                set({
                    activeSession: {
                        ...activeSession,
                        startTime: Date.now(),
                        isRunning: true,
                    },
                });
            },

            pauseTimer: () => {
                const { activeSession } = get();
                if (!activeSession.isRunning || !activeSession.startTime) return;

                const now = Date.now();
                const additionalElapsed = Math.floor((now - activeSession.startTime) / 1000);

                set({
                    activeSession: {
                        ...activeSession,
                        startTime: null,
                        elapsed: activeSession.elapsed + additionalElapsed,
                        isRunning: false,
                    },
                });
            },

            stopTimer: async (userId: string) => {
                const { activeSession } = get();

                // Calculate total duration
                let totalDuration = activeSession.elapsed;
                if (activeSession.isRunning && activeSession.startTime) {
                    const now = Date.now();
                    totalDuration += Math.floor((now - activeSession.startTime) / 1000);
                }

                if (totalDuration < 60) {
                    toast.info("Session trop courte (< 1 min), non enregistrée.");
                    get().resetTimer();
                    return;
                }

                // Save to Firestore
                try {
                    if (!db) throw new Error("Database not initialized");

                    const rawSessionData: Record<string, unknown> = {
                        userId,
                        startTime: activeSession.startTime ? activeSession.startTime - (activeSession.elapsed * 1000) : Date.now() - (totalDuration * 1000),
                        endTime: Date.now(),
                        duration: totalDuration,
                        group: activeSession.group,
                        subGroup: activeSession.subGroup,
                        taskId: activeSession.taskId,
                        taskTitle: activeSession.taskTitle,
                        type: activeSession.type,
                        notes: activeSession.notes,
                        metadata: activeSession.metadata || {},
                    };

                    // Remove values that are undefined or empty strings
                    const sessionData = Object.fromEntries(
                        Object.entries(rawSessionData).filter(([_, v]) => v !== undefined && v !== '')
                    );

                    const docRef = await addDoc(collection(db, 'sessions'), sessionData);

                    set({
                        showFeedback: true,
                        lastSavedSessionId: docRef.id
                    });

                    toast.success("Session enregistrée !");

                    // Trigger AI Analysis
                    const { runAnalysis } = (await import('./useAuthStore')).useAuthStore.getState();
                    const { sessions } = get();
                    runAnalysis(sessions);

                    get().resetTimer();

                } catch (error) {
                    console.error("Error saving session:", error);
                    toast.error("Erreur lors de l'enregistrement de la session");
                }
            },

            resetTimer: () => {
                set({ activeSession: DEFAULT_SESSION });
            },

            tick: () => {
                const { activeSession } = get();
                if (!activeSession.isRunning || !activeSession.startTime) return;

                // Distraction Alert Logic
                if (activeSession.type === 'distraction') {
                    const now = Date.now();
                    const currentElapsed = activeSession.elapsed + Math.floor((now - activeSession.startTime) / 1000);

                    // Alert every 10 minutes if distraction (600 seconds)
                    if (currentElapsed > 0 && currentElapsed % 600 === 0) {
                        toast.warning(`Cela fait ${Math.floor(currentElapsed / 60)} minutes que tu es en "Distraction".`);
                    }
                }
            },

            setCategory: (group, subGroup) => {
                set((state) => ({
                    activeSession: { ...state.activeSession, group, subGroup }
                }));
            },

            setTask: (task) => {
                set((state) => ({
                    activeSession: {
                        ...state.activeSession,
                        taskId: task.id,
                        taskTitle: task.title,
                        group: task.group,
                        subGroup: task.subGroup
                    }
                }));
            },

            setType: (type) => {
                set((state) => ({
                    activeSession: { ...state.activeSession, type }
                }));
            },

            setNotes: (notes) => {
                set((state) => ({
                    activeSession: { ...state.activeSession, notes }
                }));
            },

            setMetadata: (metadata) => {
                set((state) => ({
                    activeSession: {
                        ...state.activeSession,
                        metadata: { ...state.activeSession.metadata, ...metadata }
                    }
                }));
            },

            setShowFeedback: (show) => set({ showFeedback: show }),

            updateSessionMetadata: async (sessionId, metadata) => {
                try {
                    const docRef = doc(db, 'sessions', sessionId);
                    await updateDoc(docRef, {
                        metadata,
                        updatedAt: Date.now()
                    });
                } catch (error) {
                    console.error("Error updating session metadata:", error);
                }
            },

            subscribeToHistory: (userId: string) => {
                set({ loading: true });
                if (!db) {
                    set({ loading: false });
                    return () => { };
                }

                // Query sessions for today (or last 24h? Spec says "Today's history")
                // Let's just get the last 50 sessions for simplicity or filter client side for "Today"
                const q = query(
                    collection(db, 'sessions'),
                    where('userId', '==', userId),
                    orderBy('endTime', 'desc')
                );

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const sessions = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Session[];
                    set({ sessions, loading: false });
                }, (error) => {
                    console.error(error);
                    set({ loading: false });
                });

                return unsubscribe;
            }

        }),
        {
            name: 'tracker-storage', // unique name
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) => ({ activeSession: state.activeSession }), // Only persist active session
        }
    )
);
