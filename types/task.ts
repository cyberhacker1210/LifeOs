export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived';

export interface SubTask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    userId: string;
    title: string;
    description?: string;
    notes?: string;
    group: string; // e.g., "Scolaire", "Perso"
    subGroup?: string; // e.g., "Maths", "Maison"
    priority: TaskPriority;
    status: TaskStatus;
    date?: string; // ISO date string YYYY-MM-DD
    time?: string; // HH:mm
    duration?: number; // in minutes
    createdAt: number; // timestamp
    updatedAt: number; // timestamp
    completedAt?: number; // timestamp
    subTasks: SubTask[];
}

export type TaskGroup = {
    id: string;
    name: string;
    color: string;
    icon?: string;
    subGroups: string[];
};

export const DEFAULT_GROUPS: TaskGroup[] = [
    { id: 'scolaire', name: 'Scolaire', color: '#4F46E5', subGroups: ['Maths', 'Français', 'Histoire', 'Anglais', 'Physique', 'SVT'] },
    { id: 'sport', name: 'Sport', color: '#10B981', subGroups: ['Muscu', 'Tennis', 'Foot', 'Course'] },
    { id: 'perso', name: 'Perso', color: '#F59E0B', subGroups: ['Maison', 'Administratif', 'Santé'] },
    { id: 'projets', name: 'Projets', color: '#EC4899', subGroups: ['Code', 'Vidéo', 'Design'] },
];
