import { create } from 'zustand';
import { User, sendPasswordResetEmail, updateProfile as updateAuthProfile, updatePassword, deleteUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '@/types/user';
import { Session } from '@/types/tracker';
import { calculateChronotype, calculateEnergyCurve, detectOptimalDurations, identifyPatterns } from '@/lib/analysis';

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    profileLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateProfileInfo: (displayName?: string, photoURL?: string) => Promise<void>;
    updateSettings: (data: Partial<UserProfile>) => Promise<void>;
    updateUserPassword: (newPassword: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
    completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
    subscribeToProfile: (uid: string) => () => void;
    runAnalysis: (sessions: Session[]) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    profileLoading: true,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    logout: async () => {
        await auth.signOut();
        set({ user: null, profile: null });
    },
    resetPassword: async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    },
    updateProfileInfo: async (displayName, photoURL) => {
        const { user } = get();
        if (!user) return;
        await updateAuthProfile(user, { displayName, photoURL });

        // Update Firestore profile too
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            firstName: displayName || '',
            updatedAt: Date.now()
        });

        set({ user: { ...user, displayName, photoURL } as User });
    },
    updateSettings: async (data) => {
        const { user } = get();
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const updates = {
            ...data,
            updatedAt: Date.now()
        };
        await updateDoc(userRef, updates);
    },
    updateUserPassword: async (newPassword) => {
        const { user } = get();
        if (!user) return;
        await updatePassword(user, newPassword);
    },
    deleteAccount: async () => {
        const { user } = get();
        if (!user) return;
        await deleteUser(user);
        set({ user: null, profile: null });
    },
    completeOnboarding: async (data) => {
        const { user } = get();
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const profile: UserProfile = {
            uid: user.uid,
            firstName: data.firstName || '',
            onboardingCompleted: true,
            horaires: data.horaires || { lever: '07:00', coucher: '23:00', momentProductif: 'morning' },
            objectifs: data.objectifs || { tempsProductifParJour: 120, maxDistractionsParJour: 30, nbTachesMinParJour: 3 },
            groups: ['Scolaire', 'Sport', 'Perso', 'Projets'],
            preferences: {
                animations: true,
                taskReminders: true,
                distractionAlerts: true,
                interfaceSounds: true,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        await setDoc(userRef, profile);
        set({ profile });
    },
    subscribeToProfile: (uid) => {
        const userRef = doc(db, 'users', uid);
        return onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                set({ profile: doc.data() as UserProfile, profileLoading: false });
            } else {
                set({ profile: null, profileLoading: false });
            }
        });
    },
    runAnalysis: async (sessions) => {
        const { user } = get();
        if (!user || sessions.length < 5) return;

        try {
            const chronotype = calculateChronotype(sessions);
            const energyCurve = calculateEnergyCurve(sessions);
            const optimalSessionDurations = detectOptimalDurations(sessions);
            const patterns = identifyPatterns(sessions);

            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                chronotype,
                energyCurve,
                optimalSessionDurations,
                patterns,
                lastAnalysisDate: Date.now(),
                updatedAt: Date.now()
            });
        } catch (error) {
            console.error("Analysis Error:", error);
        }
    }
}));
