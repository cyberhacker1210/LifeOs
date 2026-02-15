import { Task } from './task';

export type SessionType = 'productive' | 'neutral' | 'distraction';

export interface SessionMetadata {
    focus?: number; // 1-5
    mood?: number; // 1-5
    energy?: number; // 1-5
    environment?: 'home' | 'office' | 'library' | 'cafe' | 'other';
    distractionsCount?: number;
    musicType?: string;
}

export interface Session {
    id: string;
    userId: string;
    startTime: number; // timestamp
    endTime: number; // timestamp
    duration: number; // seconds
    group: string;
    subGroup?: string;
    taskId?: string; // Optional link to a task
    taskTitle?: string; // Snapshot of task title
    type: SessionType;
    note?: string;
    metadata?: SessionMetadata;
}

export interface ActiveSession {
    startTime: number | null; // null if not started
    elapsed: number; // seconds accumulated before current start (if paused)
    isRunning: boolean;
    group: string;
    subGroup?: string;
    taskId?: string;
    taskTitle?: string;
    type: SessionType;
    notes?: string;
    metadata?: SessionMetadata;
}
