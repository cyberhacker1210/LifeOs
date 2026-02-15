import { Session } from '@/types/tracker';
import { Chronotype, DailyEnergyPoint, UserPattern } from '@/types/user';

export function calculateChronotype(sessions: Session[]): Chronotype {
    const hourlyCounts: Record<number, number> = {};
    sessions.filter(s => s.type === 'productive').forEach(s => {
        const hour = new Date(s.startTime).getHours();
        hourlyCounts[hour] = (hourlyCounts[hour] || 0) + s.duration;
    });

    let maxDuration = 0;
    let peakHour = 9;

    for (const [hour, duration] of Object.entries(hourlyCounts)) {
        if (duration > maxDuration) {
            maxDuration = duration;
            peakHour = parseInt(hour);
        }
    }

    if (peakHour >= 5 && peakHour < 12) return 'morning';
    if (peakHour >= 12 && peakHour < 17) return 'afternoon';
    if (peakHour >= 17 && peakHour < 22) return 'evening';
    return 'night';
}

export function calculateEnergyCurve(sessions: Session[]): DailyEnergyPoint[] {
    const curve: DailyEnergyPoint[] = Array.from({ length: 24 }, (_, i) => ({ hour: i, level: 0 }));
    const hourlyTotal: Record<number, number> = {};
    const productiveSessions = sessions.filter(s => s.type === 'productive');

    if (productiveSessions.length === 0) return curve;

    productiveSessions.forEach(s => {
        const hour = new Date(s.startTime).getHours();
        hourlyTotal[hour] = (hourlyTotal[hour] || 0) + s.duration;
    });

    const maxTotal = Math.max(...Object.values(hourlyTotal), 1);

    return curve.map(p => ({
        ...p,
        level: Math.round(((hourlyTotal[p.hour] || 0) / maxTotal) * 100)
    }));
}

export function detectOptimalDurations(sessions: Session[]): Record<string, number> {
    const subjectStats: Record<string, { total: number, count: number }> = {};

    sessions.filter(s => s.type === 'productive').forEach(s => {
        const subject = s.group || 'Général';
        if (!subjectStats[subject]) subjectStats[subject] = { total: 0, count: 0 };
        subjectStats[subject].total += s.duration;
        subjectStats[subject].count += 1;
    });

    const results: Record<string, number> = {};
    for (const [subject, stats] of Object.entries(subjectStats)) {
        results[subject] = Math.round((stats.total / stats.count) / 60); // in minutes
    }

    return results;
}

export function identifyPatterns(sessions: Session[]): UserPattern[] {
    const patterns: UserPattern[] = [];

    const productiveSessions = sessions.filter(s => s.type === 'productive');
    if (productiveSessions.length < 5) return patterns;

    // 1. Environment Analysis
    const envFocus: Record<string, { total: number, count: number }> = {};
    productiveSessions.forEach(s => {
        if (s.metadata?.environment && s.metadata?.focus) {
            const env = s.metadata.environment;
            if (!envFocus[env]) envFocus[env] = { total: 0, count: 0 };
            envFocus[env].total += s.metadata.focus;
            envFocus[env].count += 1;
        }
    });

    let bestEnv = '';
    let maxFocus = 0;
    for (const [env, stats] of Object.entries(envFocus)) {
        const avg = stats.total / stats.count;
        if (avg > maxFocus) {
            maxFocus = avg;
            bestEnv = env;
        }
    }

    if (bestEnv) {
        const envNames: Record<string, string> = { home: 'maison', office: 'bureau', library: 'BU', cafe: 'café', other: 'autre' };
        patterns.push({
            id: 'env-pattern',
            type: 'environment',
            description: `Ton environnement le plus productif semble être : ${envNames[bestEnv] || bestEnv}.`,
            confidence: 0.7,
            impact: 0.6
        });
    }

    // 2. Mood/Focus Correlation
    const avgFocus = productiveSessions.reduce((acc, s) => acc + (s.metadata?.focus || 0), 0) / productiveSessions.length;
    if (avgFocus > 4) {
        patterns.push({
            id: 'focus-pattern',
            type: 'productivity',
            description: 'Tu as un niveau de concentration exceptionnel ces derniers temps !',
            confidence: 0.9,
            impact: 0.8
        });
    }

    // 3. Chronotype (Existing logic integrated as pattern)
    const chronotype = calculateChronotype(sessions);
    const chronotypeDesc: Record<string, string> = {
        morning: 'du matin',
        afternoon: 'de l\'après-midi',
        evening: 'du soir',
        night: 'de la nuit'
    };
    patterns.push({
        id: 'chrono-pattern',
        type: 'productivity',
        description: `Tu es une personne ${chronotypeDesc[chronotype]}. C'est là que tu abats le plus de travail.`,
        confidence: 0.8,
        impact: 0.7
    });

    return patterns;
}
