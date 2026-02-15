export type Chronotype = 'morning' | 'afternoon' | 'evening' | 'night';

export interface DailyEnergyPoint {
    hour: number;
    level: number; // 0 to 100
}

export interface UserPattern {
    id: string;
    type: 'productivity' | 'procrastination' | 'habit' | 'environment';
    description: string;
    confidence: number;
    triggers?: string[];
    impact: number; // -1 to 1 (negative to positive)
}

export interface UserProfile {
    uid: string;
    firstName: string;
    onboardingCompleted: boolean;
    horaires: {
        lever: string; // HH:mm
        coucher: string; // HH:mm
        momentProductif: 'morning' | 'afternoon' | 'evening';
    };
    objectifs: {
        tempsProductifParJour: number; // minutes
        maxDistractionsParJour: number; // minutes
        nbTachesMinParJour: number;
    };
    groups: string[];

    preferences?: {
        animations: boolean;
        taskReminders: boolean;
        distractionAlerts: boolean;
        interfaceSounds: boolean;
    };

    // AI Features
    chronotype?: Chronotype;
    energyCurve?: DailyEnergyPoint[];
    patterns?: UserPattern[];
    optimalSessionDurations?: Record<string, number>; // subject -> minutes
    effectiveTactics?: string[];
    successFormula?: string;
    lastAnalysisDate?: number;

    createdAt: number;
    updatedAt: number;
}
