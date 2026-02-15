'use client';

import { useState } from 'react';
import { useHabitStore } from '@/stores/useHabitStore';
import { useAuthStore } from '@/stores/useAuthStore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { HabitType, HabitFrequency, HabitMoment } from '@/types/habit';
import {
    CheckSquare,
    Timer as TimerIcon,
    Hash,
    BarChart3,
    Plus,
    Calendar,
    CloudRain,
    Sparkles,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { suggestHabit } from '@/lib/ai';
import { toast } from 'sonner';

export function HabitCreator({ children }: { children?: React.ReactNode }) {
    const { addHabit } = useHabitStore();
    const { user } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<HabitType>('check');
    const [frequency, setFrequency] = useState<HabitFrequency>('daily');
    const [moment, setMoment] = useState<HabitMoment>('anytime');
    const [goal, setGoal] = useState<number>(0);
    const [unit, setUnit] = useState('');
    const [durationMinutes, setDurationMinutes] = useState<number>(5);
    const [icon, setIcon] = useState('💪');
    const [color, setColor] = useState('#3b82f6');

    const handleAISuggest = async () => {
        if (!name) {
            toast.error("Entrez d'abord un nom d'habitude !");
            return;
        }

        setIsSuggesting(true);
        try {
            const suggestion = await suggestHabit(name);
            if (suggestion) {
                if (suggestion.description) setDescription(suggestion.description);
                if (suggestion.type) setType(suggestion.type);
                if (suggestion.durationMinutes) setDurationMinutes(suggestion.durationMinutes);
                if (suggestion.goal) setGoal(suggestion.goal);
                if (suggestion.unit) setUnit(suggestion.unit);
                if (suggestion.frequency) setFrequency(suggestion.frequency);
                if (suggestion.moment) setMoment(suggestion.moment);
                if (suggestion.icon) setIcon(suggestion.icon);
                if (suggestion.color) setColor(suggestion.color);
                toast.success("IA : Configuration suggérée ✨");
            }
        } catch (error) {
            toast.error("Erreur lors de la suggestion IA");
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name) return;

        await addHabit({
            userId: user.uid,
            name,
            description,
            type,
            frequency,
            moment,
            goal: (type === 'counter' || type === 'value') ? goal : undefined,
            unit: (type === 'counter' || type === 'value') ? unit : undefined,
            durationMinutes: type === 'timer' ? durationMinutes : undefined,
            icon,
            color,
            order: 0,
            importanceScore: 50,
            productivityImpact: 0,
            isActive: true
        });

        setOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setType('check');
        setGoal(0);
        setUnit('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle habitude
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border-primary/20">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">✨ Nouvelle Habitude</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom de l'habitude</Label>
                        <div className="flex gap-2">
                            <Input
                                id="name"
                                placeholder="Ex: Faire 20 pompes"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-lg font-bold"
                                required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleAISuggest}
                                disabled={isSuggesting || !name}
                                className="shrink-0 aspect-square border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary"
                                title="Suggérer via IA"
                            >
                                {isSuggesting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (IA)</Label>
                        <Input
                            id="description"
                            placeholder="Description générée ou manuelle"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="text-sm opacity-80"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Type d'habitude</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { id: 'check', icon: CheckSquare, label: 'Check' },
                                { id: 'timer', icon: TimerIcon, label: 'Timer' },
                                { id: 'counter', icon: Hash, label: 'Compteur' },
                                { id: 'value', icon: BarChart3, label: 'Valeur' },
                            ].map((t) => (
                                <Button
                                    key={t.id}
                                    type="button"
                                    variant={type === t.id ? 'default' : 'outline'}
                                    className={cn(
                                        "flex flex-col h-auto pt-4 pb-2 gap-2",
                                        type === t.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                    )}
                                    onClick={() => setType(t.id as HabitType)}
                                >
                                    <t.icon className="h-5 w-5" />
                                    <span className="text-[10px] uppercase font-bold">{t.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {type === 'timer' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="duration">Durée (minutes)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                            />
                        </div>
                    )}

                    {(type === 'counter' || type === 'value') && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <Label htmlFor="goal">Objectif</Label>
                                <Input
                                    id="goal"
                                    type="number"
                                    value={goal}
                                    onChange={(e) => setGoal(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unité</Label>
                                <Input
                                    id="unit"
                                    placeholder="ex: verres, pompes"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fréquence</Label>
                            <Select value={frequency} onValueChange={(v: HabitFrequency) => setFrequency(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Tous les jours</SelectItem>
                                    <SelectItem value="weekly">Par semaine</SelectItem>
                                    <SelectItem value="specific_days">Certains jours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Moment</Label>
                            <Select value={moment} onValueChange={(v: HabitMoment) => setMoment(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Matin</SelectItem>
                                    <SelectItem value="afternoon">Après-midi</SelectItem>
                                    <SelectItem value="evening">Soir</SelectItem>
                                    <SelectItem value="anytime">N'importe quand</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button type="submit" className="px-8 font-bold">💾 Créer l'habitude</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
