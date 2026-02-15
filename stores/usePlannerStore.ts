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
import { TimeBlock, DayPlan, DayPlannerTemplate } from '@/types/planner';
import { toast } from 'sonner';

interface PlannerState {
    dayPlans: DayPlan[];
    templates: DayPlannerTemplate[];
    loading: boolean;

    // Actions
    fetchPlans: (userId: string) => () => void;
    addBlock: (date: string, block: Omit<TimeBlock, 'id' | 'userId'>) => Promise<void>;
    updateBlock: (date: string, blockId: string, updates: Partial<TimeBlock>) => Promise<void>;
    deleteBlock: (date: string, blockId: string) => Promise<void>;

    // Templates
    saveAsTemplate: (name: string, blocks: Omit<TimeBlock, 'id' | 'userId'>[]) => Promise<void>;
    applyTemplate: (date: string, templateId: string) => Promise<void>;

    // Helpers
    getDayPlan: (date: string) => DayPlan | undefined;
}

// Helper to remove undefined values before sending to Firestore
const cleanData = (data: any) => {
    return Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
    dayPlans: [],
    templates: [],
    loading: false,

    fetchPlans: (userId: string) => {
        set({ loading: true });

        // Subscribe to day plans
        const plansQuery = query(collection(db, 'day_plans'), where('userId', '==', userId));
        const unsubPlans = onSnapshot(plansQuery, (snapshot) => {
            const dayPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DayPlan));
            set({ dayPlans });
        });

        // Subscribe to templates
        const templatesQuery = query(collection(db, 'planner_templates'), where('userId', '==', userId));
        const unsubTemplates = onSnapshot(templatesQuery, (snapshot) => {
            const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DayPlannerTemplate));
            set({ templates, loading: false });
        });

        return () => {
            unsubPlans();
            unsubTemplates();
        };
    },

    addBlock: async (date, blockData) => {
        const { dayPlans } = get();
        let plan = dayPlans.find(p => p.date === date);
        const userId = (await import('@/stores/useAuthStore')).useAuthStore.getState().user?.uid;

        if (!userId) return;

        const newBlock = {
            ...blockData,
            id: Math.random().toString(36).substr(2, 9),
            userId
        };

        if (plan) {
            const planRef = doc(db, 'day_plans', plan.id);
            await updateDoc(planRef, {
                blocks: [...plan.blocks, cleanData(newBlock)] as unknown as TimeBlock[]
            });
        } else {
            const newPlan = {
                userId,
                date,
                blocks: [cleanData(newBlock)] as unknown as TimeBlock[],
                floatingHabitIds: []
            };
            await addDoc(collection(db, 'day_plans'), cleanData(newPlan));
        }
    },

    updateBlock: async (date, blockId, updates) => {
        const plan = get().dayPlans.find(p => p.date === date);
        if (!plan) return;

        const updatedBlocks = plan.blocks.map(b =>
            b.id === blockId ? { ...b, ...updates } : b
        );

        await updateDoc(doc(db, 'day_plans', plan.id), {
            blocks: updatedBlocks.map(cleanData) as unknown as TimeBlock[]
        });
    },

    deleteBlock: async (date, blockId) => {
        const plan = get().dayPlans.find(p => p.date === date);
        if (!plan) return;

        const updatedBlocks = plan.blocks.filter(b => b.id !== blockId);
        await updateDoc(doc(db, 'day_plans', plan.id), { blocks: updatedBlocks });
    },

    saveAsTemplate: async (name, blocks) => {
        const userId = (await import('@/stores/useAuthStore')).useAuthStore.getState().user?.uid;
        if (!userId) return;

        const newTemplate: Omit<DayPlannerTemplate, 'id'> = {
            userId,
            name,
            blocks
        };
        await addDoc(collection(db, 'planner_templates'), newTemplate);
        toast.success(`Template "${name}" enregistré !`);
    },

    applyTemplate: async (date, templateId) => {
        const { templates, dayPlans } = get();
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        const userId = (await import('@/stores/useAuthStore')).useAuthStore.getState().user?.uid;
        if (!userId) return;

        const newBlocks = template.blocks.map(b => ({
            ...b,
            id: Math.random().toString(36).substr(2, 9),
            userId
        }));

        const plan = dayPlans.find(p => p.date === date);
        if (plan) {
            await updateDoc(doc(db, 'day_plans', plan.id), {
                blocks: (newBlocks.map(cleanData) as unknown) as TimeBlock[]
            });
        } else {
            const newPlan: Omit<DayPlan, 'id'> = {
                userId,
                date,
                blocks: (newBlocks.map(cleanData) as unknown) as TimeBlock[],
                floatingHabitIds: []
            };
            await addDoc(collection(db, 'day_plans'), cleanData(newPlan));
        }
        toast.success("Template appliqué !");
    },

    getDayPlan: (date) => {
        return get().dayPlans.find(p => p.date === date);
    }
}));
