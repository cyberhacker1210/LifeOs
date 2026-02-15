export type TimeBlockType = 'routine' | 'school' | 'work' | 'event' | 'break' | 'free';

export interface TimeBlock {
    id: string;
    userId: string;
    type: TimeBlockType;
    label: string;
    description?: string;

    // Timing
    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"
    durationMinutes: number;

    // Integration
    routineId?: string; // If type === 'routine'
    taskId?: string;    // If type === 'work'

    // Styling
    color?: string;
    icon?: string;
}

export interface DayPlan {
    id: string;
    userId: string;
    date: string; // YYYY-MM-DD
    blocks: TimeBlock[];
    floatingHabitIds: string[]; // Habits to do "anytime"
}

export interface DayPlannerTemplate {
    id: string;
    userId: string;
    name: string; // "Journée lycée", "Week-end"
    blocks: Omit<TimeBlock, 'id' | 'userId'>[];
}
