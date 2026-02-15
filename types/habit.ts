export type HabitFrequency = 'daily' | 'weekly' | 'specific_days';
export type HabitMoment = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type HabitType = 'check' | 'timer' | 'counter' | 'value';

export interface Habit {
    id: string;
    userId: string;
    name: string;
    description?: string;

    // Schedule
    frequency: HabitFrequency;
    daysOfWeek?: number[]; // [1,2,3,4,5]
    targetTime?: string; // "07:30"
    moment: HabitMoment;

    // Measurement
    type: HabitType;
    durationMinutes?: number;
    goal?: number;
    unit?: string;

    // Organization
    groupId?: string; // "routine_matin"
    order: number;

    // Gamification
    currentStreak: number;
    bestStreak: number;
    totalCompletions: number;
    lastCompleted?: number; // timestamp

    // IA & Analytics
    importanceScore: number;
    productivityImpact: number;

    // Appearance
    icon: string;
    color: string;

    // Stacking & Integration
    stackedAfterId?: string; // Habit ID triggered after this one
    linkedTaskId?: string;
    blocksStartMode?: boolean;

    createdAt: number;
    updatedAt: number;
    isActive: boolean;
}

export interface HabitCompletion {
    id: string;
    habitId: string;
    userId: string;
    date: string; // YYYY-MM-DD
    timestamp: number;
    value?: number; // duration for timer, count for counter, value for value
    status: 'completed' | 'skipped' | 'partial';
}

export interface Routine {
    id: string;
    name: string;
    description?: string;
    moment: HabitMoment;
    startTime?: string;
    isDefault?: boolean;
    habitIds: string[];
}
