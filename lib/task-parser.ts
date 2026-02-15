import { Task, TaskPriority, DEFAULT_GROUPS } from '@/types/task';

interface ParsedTask {
    title: string;
    date?: string; // YYYY-MM-DD
    time?: string; // HH:mm
    duration?: number; // minutes
    priority: TaskPriority;
    group: string;
    subGroup?: string;
}

const PRIORITY_KEYWORDS: Record<string, TaskPriority> = {
    'urgent': 'urgent',
    'urgente': 'urgent',
    'asap': 'urgent',
    'important': 'high',
    'importante': 'high',
    'haute': 'high',
    'haut': 'high',
    '!': 'high',
    'basse': 'low',
    'bas': 'low',
    'pas urgent': 'low',
    'peu important': 'low',
};

const DURATION_REGEX = /(\d+)\s*(h|heure|heures|min|minutes|m)/i;
const TIME_REGEX = /(\d{1,2})[h:](\d{2})?/i;

const DAY_MAPPING: Record<string, number> = {
    'dimanche': 0, 'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4, 'vendredi': 5, 'samedi': 6
};

// Helper to check for a keyword with boundaries that handle French better than \b
function findKeyword(text: string, keyword: string): boolean {
    const regex = new RegExp(`(^|\\s|['"\\(\\[])${keyword}($|\\s|[.,!?;:'"\\)\\]])`, 'i');
    return regex.test(text);
}

export function parseTaskInput(input: string): ParsedTask {
    let text = input;
    const result: ParsedTask = {
        title: '',
        priority: 'normal',
        group: 'Perso', // Default
    };

    // 1. Detect Priority (Case insensitive, check if keyword exists)
    for (const [keyword, priority] of Object.entries(PRIORITY_KEYWORDS)) {
        if (findKeyword(text, keyword)) {
            result.priority = priority;
            // Use regex to remove with boundaries to avoid destroying words
            const regex = new RegExp(`(^|\\s|['"\\(\\[])${keyword}($|\\s|[.,!?;:'"\\)\\]])`, 'i');
            text = text.replace(regex, (match, p1, p2) => (p1 + p2)).trim();
            break; // Take the first match
        }
    }

    // 2. Detect Duration (e.g., "2h", "30min")
    const durationMatch = text.match(DURATION_REGEX);
    if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();

        if (unit.startsWith('h')) {
            result.duration = value * 60;
        } else {
            result.duration = value;
        }
        text = text.replace(durationMatch[0], '').trim();
    }

    // 3. Detect Group (Keywords)
    // We search through all groups and their subgroups/keywords
    // For now, we'll use the group name as the primary keyword, plus some hardcoded synonyms from spec
    // In a real app, these keywords would be part of the Group definition
    let groupFound = false;

    // Extended keywords based on spec
    const SCOLAIRE_KEYWORDS = ['maths', 'français', 'physique', 'chimie', 'svt', 'anglais', 'espagnol', 'histoire', 'géo', 'philo', 'cours', 'réviser', 'devoir', 'dm', 'ds', 'contrôle', 'exercice', 'exposé'];
    const SPORT_KEYWORDS = ['sport', 'foot', 'basket', 'tennis', 'muscu', 'salle', 'courir', 'entraînement', 'match'];
    const PERSO_KEYWORDS = ['maison', 'ranger', 'courses', 'rdv', 'médecin', 'administratif'];
    const PROJET_KEYWORDS = ['projet', 'code', 'app', 'site', 'vidéo', 'créer', 'apprendre'];

    const keywordMap: Record<string, string> = {};
    SCOLAIRE_KEYWORDS.forEach(k => keywordMap[k] = 'Scolaire');
    SPORT_KEYWORDS.forEach(k => keywordMap[k] = 'Sport');
    PERSO_KEYWORDS.forEach(k => keywordMap[k] = 'Perso');
    PROJET_KEYWORDS.forEach(k => keywordMap[k] = 'Projets');

    // Check for explicit Group names first
    for (const group of DEFAULT_GROUPS) {
        if (new RegExp(`\\b${group.name}\\b`, 'i').test(text)) {
            result.group = group.name;
            text = text.replace(new RegExp(`\\b${group.name}\\b`, 'i'), '').trim();
            groupFound = true;
            break;
        }
    }

    if (!groupFound) {
        // Check keywords
        const words = text.split(/\s+/);
        for (const word of words) {
            const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
            if (keywordMap[cleanWord]) {
                result.group = keywordMap[cleanWord];
                // We DON'T remove the keyword from the title if it's essential (e.g. "Réviser maths")
                // But for "Projet LifeOS", "Projet" is generic.
                // Let's keep it simple: Keep the word in title for now.
                // But we could identify SubGroup here.
                const subgroups = DEFAULT_GROUPS.find(g => g.name === result.group)?.subGroups || [];
                // naive subgroup check: capitalized match or direct match
                const matchSub = subgroups.find(sg => sg.toLowerCase() === cleanWord);
                if (matchSub) {
                    result.subGroup = matchSub;
                }
                break;
            }
        }
    }


    // 4. Detect Date
    const today = new Date();
    let targetDate: Date | null = null;
    let dateStrToRemove = '';

    const lowerText = text.toLowerCase();

    if (lowerText.includes('demain')) {
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 1);
        dateStrToRemove = 'demain';
    } else if (lowerText.includes('après-demain')) {
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 2);
        dateStrToRemove = 'après-demain';
    } else if (lowerText.includes('aujourd\'hui')) {
        targetDate = new Date(today);
        dateStrToRemove = 'aujourd\'hui';
    } else {
        // Check days of week "lundi", "mardi next" etc.
        // Simple "lundi" means "next monday" (or today if it is monday? usually next)
        for (const [dayName, dayIndex] of Object.entries(DAY_MAPPING)) {
            if (lowerText.includes(dayName)) {
                const currentDay = today.getDay();
                let diff = dayIndex - currentDay;
                if (diff <= 0) diff += 7; // Next occurrence
                targetDate = new Date(today);
                targetDate.setDate(today.getDate() + diff);
                dateStrToRemove = dayName;
                break;
            }
        }
    }

    // Check specific formats "le 15", "le 15/01"
    const specificDateRegex = /le\s+(\d{1,2})(\/(\d{1,2}))?(\/(\d{2,4}))?/i;
    const dateMatch = text.match(specificDateRegex);
    if (dateMatch && !targetDate) {
        const day = parseInt(dateMatch[1]);
        const month = dateMatch[3] ? parseInt(dateMatch[3]) - 1 : today.getMonth(); // Default to current month
        let year = dateMatch[5] ? parseInt(dateMatch[5]) : today.getFullYear();
        if (dateMatch[5] && dateMatch[5].length === 2) year += 2000;

        // If date is in past and no year specified, assume next year
        const testDate = new Date(year, month, day);
        if (!dateMatch[5] && testDate < today) {
            testDate.setFullYear(year + 1);
        }

        targetDate = testDate;
        dateStrToRemove = dateMatch[0];
    }

    if (targetDate) {
        result.date = targetDate.toISOString().split('T')[0];
        // Clean text carefully
        // We use a simple replace here, might be risky if word appears twice
        // Better: replace first occurrence
        text = text.replace(dateStrToRemove, '').trim();

        // Remove "pour" or "avant" if they preceded the date
        text = text.replace(/pour\s*$/, '').replace(/avant\s*$/, '').trim();
    }


    // 5. Cleanup Title
    // Remove extra spaces, capitalized first letter
    text = text.replace(/\s+/g, ' ').trim();
    if (text.length > 0) {
        result.title = text.charAt(0).toUpperCase() + text.slice(1);
    } else {
        // Fallback if everything was parsed out
        result.title = input;
    }

    return result;
}
